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

  const dirs = (await fs.readdir(path.join(root, 'skills'), { withFileTypes: true }))
    .filter((entry) => entry.isDirectory()).map((entry) => entry.name);
  equalSet(manifests[0].skills, dirs.map((name) => `skills/${name}/SKILL.md`), 'MiniMax skills');
  equalSet(manifests[1].skills, dirs.map((name) => `./skills/${name}`), 'Claude skills');
  for (const name of dirs) {
    const text = await read(`skills/${name}/SKILL.md`);
    const frontmatter = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    assert.ok(frontmatter, `${name}: missing frontmatter`);
    assert.equal(frontmatter[1].match(/^name:\s*(.+)$/m)?.[1].trim(), name, `${name}: frontmatter name`);
  }
  console.log(`PASS: ${dirs.length} skill directories match both manifests; versions and names agree`);

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
