#!/usr/bin/env node
/**
 * update-upstream.mjs — 把本插件 vendored 的技能副本同步到 addyosmani/agent-skills 上游最新。
 *
 * 设计前提：vendored 文件一律不做本地改写。技能正文里的 `../../references/x.md`
 * 恰好等于本包的 `references/`，所以「零改写 + 纯镜像」成立，更新就只是覆盖文件，
 * 不存在合并冲突。唯一例外是本包自写的索引 skill 与文档，已在 lock 的 unmanaged 中登记。
 *
 * 用法：
 *   node scripts/update-upstream.mjs --check     看上游有没有更新 + 本地有没有被改脏
 *   node scripts/update-upstream.mjs --apply     同步到上游最新，并镜像到安装目录
 *   node scripts/update-upstream.mjs --install   不联网，只把当前包镜像到安装目录
 *
 * 通用参数：--ref <branch|tag|sha>  --install-dir <path>  --force  --yes  --keep-temp
 *
 * 临时目录：每次运行在 os.tmpdir() 下新建一个只属于本次运行的目录，结束后删除该目录本身
 * （只删自己刚建的，不触碰任何用户文件）。加 --keep-temp 可保留它以便排查。
 */

import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const PKG_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LOCK_FILE = path.join(PKG_ROOT, 'upstream.lock.json');
const PLUGIN_NAME = 'harness-engineering-skills';
const DEFAULT_INSTALL_DIR = path.join(os.homedir(), '.minimax', 'plugins', PLUGIN_NAME);

const REPO = 'addyosmani/agent-skills';
const REPO_URL = `https://github.com/${REPO}`;
const DEFAULT_REF = 'main';

/** 采纳的 9 个技能目录（与 SKILL.md 名称一致）。 */
const SKILLS = [
  'security-and-hardening',
  'performance-optimization',
  'frontend-ui-engineering',
  'browser-testing-with-devtools',
  'ci-cd-and-automation',
  'observability-and-instrumentation',
  'shipping-and-launch',
  'deprecation-and-migration',
  'constraint-driven-development',
];

/** 这 9 个技能正文以 ../../references/x.md 引用的仓库级共享清单，按 skill 单装会丢。 */
const SHARED_REFS = [
  'security-checklist.md',
  'performance-checklist.md',
  'accessibility-checklist.md',
  'observability-checklist.md',
  'definition-of-done.md',
];

/** 仓库根文件，需要一起带走的。 */
const ROOT_FILES = ['LICENSE'];

/** 本包自写、同步脚本不接管的文件。 */
const UNMANAGED = [
  '.minimax-plugin/plugin.json',
  'icon.jpg',
  'icon-dark.jpg',
  'upstream.lock.json',
  'README.md',
  'PROVENANCE.md',
  'scripts/update-upstream.mjs',
  'skills/harness-engineering-skills-index/SKILL.md',
];

// 复制到安装目录时跳过的开发期文件
const SKIP_NAMES = new Set(['.git', '.gitignore', 'node_modules', '.scratch', '.DS_Store', 'Thumbs.db']);

// ---------------------------------------------------------------- CLI helpers

function parseArgs(argv) {
  const opts = { mode: null, ref: DEFAULT_REF, installDir: DEFAULT_INSTALL_DIR, force: false, yes: false, keepTemp: false };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--check') opts.mode = 'check';
    else if (a === '--apply') opts.mode = 'apply';
    else if (a === '--install') opts.mode = 'install';
    else if (a === '--force') opts.force = true;
    else if (a === '--yes' || a === '-y') opts.yes = true;
    else if (a === '--keep-temp') opts.keepTemp = true;
    else if (a === '--ref') opts.ref = argv[++i];
    else if (a === '--install-dir') opts.installDir = path.resolve(argv[++i]);
    else if (a === '--help' || a === '-h') opts.mode = 'help';
    else throw new Error(`未知参数：${a}`);
  }
  if (!opts.mode) throw new Error('必须指定 --check / --apply / --install 之一');
  return opts;
}

const HELP = `用法：node scripts/update-upstream.mjs <模式> [参数]

模式
  --check        比对上游 HEAD 与本地锁定版本，列出新增/变更/删除与本地漂移，不写任何文件
  --apply        拉取上游目标 ref 的归档、镜像覆盖 vendored 文件、刷新 upstream.lock.json，
                 并把整个包镜像到安装目录
  --install      不联网，只校验并把当前包镜像到安装目录

参数
  --ref <b|t|s>  上游 ref，默认 main；--apply 会先解析成具体 commit 再按 commit 下载
  --install-dir  安装目录，默认 ~/.minimax/plugins/${PLUGIN_NAME}
  --force        忽略本地漂移告警强制覆盖（会丢弃本地对 vendored 文件的修改）
  --yes          跳过删除安装目录旧内容前的确认
  --keep-temp    保留本次下载解包的临时目录，便于排查
`;

function say(msg = '') { process.stdout.write(`${msg}\n`); }
function warn(msg) { process.stderr.write(`${msg}\n`); }

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, ...opts });
  if (r.error) return { ok: false, stdout: '', stderr: r.error.message, missing: r.error.code === 'ENOENT' };
  return { ok: r.status === 0, stdout: r.stdout ?? '', stderr: r.stderr ?? '', missing: false };
}

// ---------------------------------------------------------------- fs helpers

async function exists(p) {
  try { await fs.stat(p); return true; } catch { return false; }
}

async function listFilesRecursive(dir, base = dir) {
  const out = [];
  let entries;
  try { entries = await fs.readdir(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    if (SKIP_NAMES.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await listFilesRecursive(full, base)));
    else if (e.isFile()) out.push(path.relative(base, full).split(path.sep).join('/'));
  }
  return out;
}

async function sha256File(file) {
  const buf = await fs.readFile(file);
  return { sha256: createHash('sha256').update(buf).digest('hex'), bytes: buf.length };
}

/** 把 CRLF 归一为 LF 后的 sha256。用于识别「内容没改、只是换行符被转了」。 */
async function sha256EolNormalized(file) {
  const text = (await fs.readFile(file)).toString('utf8').replace(/\r\n/g, '\n');
  return createHash('sha256').update(Buffer.from(text, 'utf8')).digest('hex');
}

const toPosix = (p) => p.split(path.sep).join('/');

/** 每个受管分组：上游路径 → 本包路径（目录或单文件都支持）。 */
function managedGroups() {
  return [
    ...SKILLS.map((s) => ({ id: `skills/${s}`, upstream: `skills/${s}`, local: `skills/${s}` })),
    ...SHARED_REFS.map((f) => ({ id: `references/${f}`, upstream: `references/${f}`, local: `references/${f}` })),
    ...ROOT_FILES.map((f) => ({ id: f, upstream: f, local: f })),
  ];
}

/** 展开成本包内相对路径 → { localAbs, upstreamAbs } 的完整清单。 */
async function expandGroups(srcRoot) {
  const items = [];
  for (const g of managedGroups()) {
    const up = path.join(srcRoot, ...g.upstream.split('/'));
    const upStat = await exists(up) ? await fs.stat(up) : null;
    if (!upStat) continue;
    if (upStat.isFile()) {
      items.push({ rel: g.local, localAbs: path.join(PKG_ROOT, ...g.local.split('/')), upstreamAbs: up, group: g.id });
      continue;
    }
    for (const rel of await listFilesRecursive(up)) {
      const localRel = path.posix.join(g.local, rel);
      items.push({
        rel: localRel,
        localAbs: path.join(PKG_ROOT, ...localRel.split('/')),
        upstreamAbs: path.join(up, ...rel.split('/')),
        group: g.id,
      });
    }
  }
  return items;
}

// ---------------------------------------------------------------- 上游获取

async function resolveRemoteSha(ref) {
  if (/^[0-9a-f]{40}$/i.test(ref)) return { sha: ref.toLowerCase(), via: '显式 commit' };
  const git = run('git', ['ls-remote', `${REPO_URL}.git`, ref, 'HEAD']);
  if (git.ok) {
    for (const line of git.stdout.split('\n')) {
      const [sha, name] = line.trim().split(/\s+/);
      if (sha && name === 'HEAD') return { sha: sha.toLowerCase(), via: 'git ls-remote' };
    }
  }
  const res = await fetch(`https://api.github.com/repos/${REPO}/commits/${ref}`, {
    headers: { 'User-Agent': `${PLUGIN_NAME}-sync`, Accept: 'application/vnd.github+json' },
  });
  if (!res.ok) throw new Error(`无法解析上游 ${ref}：git 不可用且 GitHub API 返回 ${res.status}`);
  const body = await res.json();
  if (!body.sha) throw new Error(`GitHub API 未返回 commit sha（ref=${ref}）`);
  return { sha: String(body.sha).toLowerCase(), via: 'GitHub API' };
}

async function downloadArchive(sha) {
  const tmp = path.join(os.tmpdir(), `${PLUGIN_NAME}-sync-${process.pid}-${Date.now()}`);
  await fs.mkdir(tmp, { recursive: true });
  const tgz = path.join(tmp, 'upstream.tar.gz');
  const url = `https://codeload.github.com/${REPO}/tar.gz/${sha}`;
  say(`  下载 ${url}`);
  const res = await fetch(url, { headers: { 'User-Agent': `${PLUGIN_NAME}-sync` } });
  if (!res.ok) throw new Error(`下载失败：HTTP ${res.status} ${url}`);
  await fs.writeFile(tgz, Buffer.from(await res.arrayBuffer()));
  // 上游归档里含符号链接（例如 .opencode/skills），Windows 的 tar 建不出来。
  // 清单也从 tar 的报错里出现过「Invalid argument」——但我们要的 skills/references/LICENSE
  // 都是普通目录，因此只解这三块，其余一律不看。
  const listing = run('tar', ['-tzf', tgz]);
  if (!listing.ok) {
    if (listing.missing) throw new Error('系统缺少 tar 命令，无法解包上游归档（Windows 10+ 自带 tar.exe）');
    throw new Error(`读取归档清单失败：${listing.stderr.trim()}`);
  }
  const firstEntry = listing.stdout.split('\n').map((s) => s.trim()).find(Boolean);
  if (!firstEntry) throw new Error('上游归档为空');
  const rootName = firstEntry.split('/')[0];
  const src = path.join(tmp, rootName);

  for (const member of [`${rootName}/skills`, `${rootName}/references`, `${rootName}/LICENSE`]) {
    const untar = run('tar', ['-xzf', tgz, '-C', tmp, member]);
    if (!untar.ok) {
      if (untar.missing) throw new Error('系统缺少 tar 命令，无法解包上游归档（Windows 10+ 自带 tar.exe）');
      if (member.endsWith('/skills')) throw new Error(`解包 skills 失败：${untar.stderr.trim()}`);
      warn(`  提示：归档中解不出 ${member}，已跳过`);
    }
  }
  if (!(await exists(path.join(src, 'skills')))) throw new Error('解包结果异常：缺少 skills 目录');
  return { tmp, src };
}

// ---------------------------------------------------------------- 锁文件

async function readLock() {
  try { return JSON.parse(await fs.readFile(LOCK_FILE, 'utf8')); } catch { return null; }
}

async function writeLock(sha, ref, managedMap) {
  const lock = {
    plugin: PLUGIN_NAME,
    repo: REPO,
    repoUrl: REPO_URL,
    license: 'MIT (Copyright (c) 2025 Addy Osmani)',
    upstreamRef: ref,
    commit: sha,
    syncedAt: new Date().toISOString(),
    policy: 'vendored 文件零本地改写；未出现在 managed 中的路径由本包自行维护，同步脚本不接管。',
    managed: Object.fromEntries([...managedMap.entries()].sort(([a], [b]) => (a < b ? -1 : 1))),
    unmanaged: UNMANAGED,
  };
  await fs.writeFile(LOCK_FILE, `${JSON.stringify(lock, null, 2)}\n`, 'utf8');
  return lock;
}

// ---------------------------------------------------------------- 漂移检测

async function detectDrift(lock) {
  const drifted = [];
  const missing = [];
  const eolOnly = [];
  for (const [rel, meta] of Object.entries(lock.managed ?? {})) {
    const abs = path.join(PKG_ROOT, ...rel.split('/'));
    if (!(await exists(abs))) { missing.push(rel); continue; }
    const cur = await sha256File(abs);
    if (cur.sha256 === meta.sha256) continue;
    // 内容一致、只是换行符被转：不是本地改内容，不该拦住同步
    if ((await sha256EolNormalized(abs)) === meta.sha256) { eolOnly.push(rel); continue; }
    drifted.push({ rel, from: meta.sha256.slice(0, 12), to: cur.sha256.slice(0, 12) });
  }
  return { drifted, missing, eolOnly };
}

// ---------------------------------------------------------------- 差异与镜像

async function planChanges(srcRoot) {
  const upstream = await expandGroups(srcRoot);
  const upstreamRel = new Set(upstream.map((u) => u.rel));
  const rows = [];

  for (const u of upstream) {
    const cur = await exists(u.localAbs) ? await sha256File(u.localAbs) : null;
    const up = await sha256File(u.upstreamAbs);
    let status;
    if (!cur) status = 'NEW';
    else if (cur.sha256 === up.sha256) status = 'SAME';
    else if ((await sha256EolNormalized(u.localAbs)) === (await sha256EolNormalized(u.upstreamAbs))) status = 'EOL';
    else status = 'UPDATE';
    rows.push({ ...u, status, upstream: up });
  }

  // 本包里存在、上游已删除的受管文件
  const localManaged = new Set();
  for (const g of managedGroups()) {
    const base = path.join(PKG_ROOT, ...g.local.split('/'));
    let st = null;
    try { st = await fs.stat(base); } catch { continue; }
    if (st.isFile()) localManaged.add(g.local);
    else for (const rel of await listFilesRecursive(base)) localManaged.add(path.posix.join(g.local, rel));
  }
  for (const rel of localManaged) {
    if (!upstreamRel.has(rel)) rows.push({ rel, localAbs: path.join(PKG_ROOT, ...rel.split('/')), upstreamAbs: null, status: 'REMOVE' });
  }
  return rows;
}

function printRows(rows) {
  const pad = Math.max(...rows.map((r) => r.rel.length), 12);
  for (const r of rows.sort((a, b) => (a.rel < b.rel ? -1 : 1))) {
    const mark = { NEW: '+', UPDATE: '~', REMOVE: '-', EOL: '~', SAME: ' ' }[r.status];
    const detail = r.status === 'NEW' ? `${r.upstream.bytes} B  (新增)`
      : r.status === 'UPDATE' ? `${r.upstream.bytes} B`
      : r.status === 'EOL' ? '仅换行符差异，将按上游 LF 修复'
      : r.status === 'REMOVE' ? '(上游已删除)'
      : '';
    say(`${mark} ${r.rel.padEnd(pad)}  ${detail}`);
  }
}

async function applyRows(rows) {
  const managedMap = new Map();
  let written = 0;
  let removed = 0;
  for (const r of rows) {
    if (r.status === 'REMOVE') { await fs.rm(r.localAbs); removed += 1; continue; }
    if (r.status === 'SAME') {
      const cur = await sha256File(r.localAbs);
      managedMap.set(r.rel, { sha256: cur.sha256, bytes: cur.bytes });
      continue;
    }
    await fs.mkdir(path.dirname(r.localAbs), { recursive: true });
    await fs.copyFile(r.upstreamAbs, r.localAbs);
    managedMap.set(r.rel, { sha256: r.upstream.sha256, bytes: r.upstream.bytes });
    written += 1;
  }
  return { managedMap, written, removed };
}

// ---------------------------------------------------------------- 安装镜像

async function collectPackageFiles(dir, base = dir) {
  const out = [];
  let entries;
  try { entries = await fs.readdir(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    if (SKIP_NAMES.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await collectPackageFiles(full, base)));
    else if (e.isFile()) out.push(path.relative(base, full));
  }
  return out;
}

async function mirrorToInstall(installDir) {
  const marker = path.join(installDir, '.minimax-plugin', 'plugin.json');
  if (await exists(installDir)) {
    if (!(await exists(marker))) {
      throw new Error(`拒绝写入：${installDir} 已存在且不像 ${PLUGIN_NAME} 包（缺 .minimax-plugin/plugin.json）`);
    }
    const m = JSON.parse(await fs.readFile(marker, 'utf8'));
    if (m.name !== PLUGIN_NAME) {
      throw new Error(`拒绝写入：${installDir} 的 manifest name 是 ${m.name}，不是 ${PLUGIN_NAME}`);
    }
    const current = await collectPackageFiles(installDir);
    say(`  清理旧安装内容 ${current.length} 个文件…`);
    for (const rel of current) await fs.rm(path.join(installDir, rel), { force: true });
  }
  await fs.mkdir(installDir, { recursive: true });
  const files = await collectPackageFiles(PKG_ROOT);
  for (const rel of files) {
    const dest = path.join(installDir, rel);
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await fs.copyFile(path.join(PKG_ROOT, rel), dest);
  }
  return files.length;
}

// ---------------------------------------------------------------- 主流程

async function main() {
  let opts;
  try { opts = parseArgs(process.argv.slice(2)); } catch (e) { warn(`✗ ${e.message}`); say(HELP); process.exit(2); }
  if (opts.mode === 'help') { say(HELP); return; }

  const lock = await readLock();

  if (opts.mode === 'install') {
    say(`→ 镜像到安装目录（不联网）`);
    const n = await mirrorToInstall(opts.installDir);
    say(`✓ 已安装 ${n} 个文件：${opts.installDir}`);
    if (!lock) warn('! 没有 upstream.lock.json，建议先跑一次 --apply 建立锁定版本');
    return;
  }

  say(`→ 解析上游 ${REPO} @ ${opts.ref}`);
  const { sha, via } = await resolveRemoteSha(opts.ref);
  say(`  上游 commit ${sha}（${via}）`);
  const behind = !lock || lock.commit !== sha;
  say(`  本地锁定 ${lock ? lock.commit.slice(0, 12) : '（无）'} → ${behind ? '有更新' : '已是最新'}`);

  say(`  下载归档…`);
  const { tmp, src } = await downloadArchive(sha);
  try {
    const rows = await planChanges(src);
    const changed = rows.filter((r) => r.status !== 'SAME');
    say('');
    printRows(rows);
    say('');
    say(`  合计 ${rows.length} 个受管文件：${rows.filter((r) => r.status === 'SAME').length} 未变、` +
      `${rows.filter((r) => r.status === 'UPDATE').length} 变更、${rows.filter((r) => r.status === 'NEW').length} 新增、` +
      `${rows.filter((r) => r.status === 'EOL').length} 仅换行符差异、${rows.filter((r) => r.status === 'REMOVE').length} 上游已删除`);

    if (lock) {
      const { drifted, missing, eolOnly } = await detectDrift(lock);
      if (eolOnly.length) {
        say(`  ℹ ${eolOnly.length} 处仅换行符差异（内容未改，多为 CRLF↔LF），不视为本地改动；`);
        say('    --apply 会按上游 LF 覆盖修复，仓库已用 .gitattributes 固定 LF 避免复发。');
      }
      if (drifted.length || missing.length) {
        warn('');
        warn(`⚠ 本地漂移 ${drifted.length + missing.length} 处（本地改过 vendored 文件，会在同步时被覆盖）：`);
        for (const d of drifted) warn(`   ~ ${d.rel}  ${d.from} → ${d.to}`);
        for (const rel of missing) warn(`   - ${rel}  本地缺失`);
        if (opts.mode === 'apply' && !opts.force) {
          throw new Error('已中止：先确认要丢弃这些本地改动，加 --force 覆盖，或先手工处理。');
        }
      } else {
        say('  本地漂移 0 处（vendored 文件与锁定版本一致）');
      }
    }

    if (opts.mode === 'check') {
      say('');
      say(changed.length ? `结论：上游有 ${changed.length} 处变化，--check 未写任何文件。` : '结论：已是最新，--check 未写任何文件。');
      return;
    }

    say('');
    say(`→ 镜像覆盖 vendored 文件`);
    const { managedMap, written, removed } = await applyRows(rows);
    await writeLock(sha, opts.ref, managedMap);
    say(`✓ 写入 ${written} 个、清理 ${removed} 个；upstream.lock.json 已更新为 ${sha.slice(0, 12)}`);

    say(`→ 镜像到安装目录`);
    const n = await mirrorToInstall(opts.installDir);
    say(`✓ 已安装 ${n} 个文件：${opts.installDir}`);
    say('');
    say('提示：MiniMax Code 的本地插件自动重扫可能需要几秒；若未刷新，重启一次客户端。');
  } finally {
    if (opts.keepTemp) warn(`临时目录已保留：${tmp}`);
    else await fs.rm(tmp, { recursive: true, force: true });
  }
}

main().catch((e) => {
  warn(`✗ ${e.message}`);
  process.exit(1);
});
