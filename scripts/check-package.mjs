#!/usr/bin/env node
// Offline package gate: discovery, versions, vendored bytes and local ownership.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => fs.readFile(path.join(root, rel), 'utf8');
const json = async (rel) => JSON.parse(await read(rel));
const equalSet = (actual, expected, label) => {
  assert.equal(new Set(actual).size, actual.length, `${label}: duplicate entry`);
  assert.deepEqual([...actual].sort(), [...expected].sort(), `${label}: mismatch`);
};

async function filesBelow(rel) {
  const files = [];
  for (const entry of await fs.readdir(path.join(root, rel), { withFileTypes: true })) {
    const child = `${rel}/${entry.name}`;
    if (entry.isDirectory()) files.push(...await filesBelow(child));
    else if (entry.isFile()) files.push(child);
    else throw new Error(`Unsupported package entry: ${child}`);
  }
  return files;
}

async function main() {
  const manifests = await Promise.all([
    '.minimax-plugin/plugin.json', '.claude-plugin/plugin.json', 'plugin.json', 'package.json',
  ].map(json));
  assert.equal(new Set(manifests.map((m) => m.version)).size, 1, 'Manifest version mismatch');
  assert.equal(new Set(manifests.map((m) => m.name)).size, 1, 'Manifest name mismatch');

  // Agent Plugins 1.0.0 §5: root plugin.json is the only portable manifest, its top-level field
  // set is closed, and §5.5 constrains the name. Without this the package silently stops conforming
  // the next time someone edits a manifest by hand.
  const plugin = await json('plugin.json');
  const PLUGIN_FIELDS = new Set([
    '$schema', 'name', 'version', 'description', 'author', 'homepage', 'repository', 'license', 'keywords', 'extensions',
  ]);
  const unknown = Object.keys(plugin).filter((key) => !PLUGIN_FIELDS.has(key));
  assert.deepEqual(unknown, [], `plugin.json: fields outside the closed §5.2 set: ${unknown.join(', ')}`);
  assert.equal(
    plugin.$schema,
    'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json',
    'plugin.json: $schema must be the canonical 1.0.0 identifier (§5.3)',
  );
  assert.ok(plugin.name && typeof plugin.name === 'string', 'plugin.json: missing name (§5.3)');
  assert.match(
    plugin.name,
    /^(?!.*(?:--|\.\.))[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/,
    `plugin.json: name "${plugin.name}" violates §5.5`,
  );
  assert.ok(plugin.name.length <= 64, 'plugin.json: name exceeds 64 characters (§5.5)');
  if (plugin.author) {
    const authorKeys = Object.keys(plugin.author);
    assert.ok(
      authorKeys.every((key) => ['name', 'email', 'url'].includes(key)),
      `plugin.json: author may only carry name/email/url (§5.4): ${authorKeys.join(', ')}`,
    );
  }
  console.log(`PASS: root plugin.json validates against Agent Plugins 1.0.0 §5 (${plugin.name} ${plugin.version})`);

  const dirs = (await fs.readdir(path.join(root, 'skills'), { withFileTypes: true }))
    .filter((entry) => entry.isDirectory()).map((entry) => entry.name);
  equalSet(manifests[0].skills, dirs.map((name) => `skills/${name}/SKILL.md`), 'MiniMax skills');
  equalSet(manifests[1].skills, dirs.map((name) => `./skills/${name}`), 'Claude skills');

  // Agent Skills format (https://agentskills.io/specification), which Agent Plugins §7.1 defers to:
  // closed frontmatter field set, name matching its directory, and bounded description length.
  const SKILL_FIELDS = new Set(['name', 'description', 'license', 'compatibility', 'metadata', 'allowed-tools']);
  for (const name of dirs) {
    const text = await read(`skills/${name}/SKILL.md`);
    const frontmatter = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    assert.ok(frontmatter, `${name}: missing frontmatter`);
    const lines = frontmatter[1].split(/\r?\n/);
    const field = (key) => {
      const at = lines.findIndex((line) => line.startsWith(`${key}:`));
      if (at < 0) return null;
      const parts = [lines[at].slice(key.length + 1).trim()];
      for (let i = at + 1; i < lines.length && /^\s+\S/.test(lines[i]); i++) parts.push(lines[i].trim());
      return parts.join(' ').replace(/\s+/g, ' ').trim();
    };
    const skillName = field('name');
    assert.equal(skillName, name, `${name}: frontmatter name`);
    assert.match(skillName, /^(?!.*--)[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/, `${name}: name violates Agent Skills naming`);
    assert.ok(skillName.length <= 64, `${name}: name exceeds 64 characters`);
    const description = field('description') ?? '';
    assert.ok(
      description.length >= 1 && description.length <= 1024,
      `${name}: description must be 1-1024 characters (is ${description.length})`,
    );
    const compatibility = field('compatibility');
    if (compatibility !== null) {
      assert.ok(compatibility.length <= 500, `${name}: compatibility exceeds 500 characters`);
    }
    const keys = lines.filter((line) => /^[A-Za-z][A-Za-z0-9_-]*:/.test(line)).map((line) => line.split(':')[0]);
    const extra = keys.filter((key) => !SKILL_FIELDS.has(key));
    assert.deepEqual(extra, [], `${name}: frontmatter outside the Agent Skills set: ${extra.join(', ')}`);
  }
  console.log(`PASS: ${dirs.length} skills match both manifests and the Agent Skills format; versions and names agree`);

  const lock = await json('upstream.lock.json');
  const managed = new Set();
  for (const source of Object.values(lock.sources)) {
    assert.ok(!source.skills.includes('old-code'), 'old-code must remain locally maintained');
    for (const [rel, meta] of Object.entries(source.managed)) {
      assert.ok(!managed.has(rel), `Multiple owners: ${rel}`);
      assert.ok(!rel.startsWith('skills/old-code/'), `old-code is managed by upstream: ${rel}`);
      assert.ok(!lock.unmanaged.includes(rel), `Managed/unmanaged overlap: ${rel}`);
      managed.add(rel);
      const bytes = await fs.readFile(path.join(root, rel));
      assert.equal(bytes.length, meta.bytes, `Vendored size drift: ${rel}`);
      assert.equal(createHash('sha256').update(bytes).digest('hex'), meta.sha256, `Vendored hash drift: ${rel}`);
    }
  }
  console.log(`PASS: ${managed.size} vendored files match locked bytes and SHA-256`);

  const localFiles = await filesBelow('skills/old-code');
  equalSet(lock.unmanaged.filter((rel) => rel.startsWith('skills/old-code/')), localFiles, 'old-code ownership');
  for (const rel of localFiles.filter((file) => file.endsWith('.md'))) {
    const text = await read(rel);
    for (const [, target] of text.matchAll(/\]\(([^)]+)\)/g)) {
      if (/^(?:https?:|#)/.test(target)) continue;
      const resolved = path.resolve(root, path.dirname(rel), target.split('#')[0]);
      assert.ok((await fs.stat(resolved)).isFile(), `${rel}: missing local link ${target}`);
    }
  }
  console.log('PASS: old-code is fully registered as local content; local Markdown links resolve');
}

main().catch((error) => {
  console.error(`FAIL: ${error.message}`);
  process.exitCode = 1;
});
