#!/usr/bin/env node
/**
 * update-upstream.mjs — 把本插件 vendored 的技能副本同步到各上游仓库的最新版本。
 *
 * 设计前提：vendored 文件一律不做本地改写。addyosmani 那边技能正文里的
 * `../../references/x.md` 恰好等于本包的 `references/`，所以「零改写 + 纯镜像」成立，
 * 更新就只是覆盖文件，不存在合并冲突。本包自写的入口、old-code 与维护文件不参与上游同步，
 * 已在 lock 的 unmanaged 中登记。
 *
 * 本脚本管两个上游，配方只差仓库地址与清单：
 *   - addyosmani/agent-skills：15 个技能（A 组 10 + B 组 5）+ 6 份仓库级共享清单
 *   - obra/superpowers：5 个技能（C 组，补 mattpocock-skills 侧的空缺），无共享清单
 *
 * 用法：
 *   node scripts/update-upstream.mjs --check     看各上游有没有更新 + 本地有没有被改脏
 *   node scripts/update-upstream.mjs --apply     同步到上游最新，并镜像到安装目录
 *   node scripts/update-upstream.mjs --install   不联网，只把当前包镜像到安装目录
 *
 * 通用参数：--only <source>  --ref <branch|tag|sha>  --install-dir <path>
 *           --force  --yes  --keep-temp
 *
 * 临时目录：每个上游每次运行在 os.tmpdir() 下新建一个只属于本次运行的目录，结束后删除该目录本身
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

/**
 * 上游配方。`skills` 目录名与该技能 SKILL.md 的 name 一致。
 *
 * ── agent-skills ─────────────────────────────────────────────────────────
 * A 组「精选 10 个」——按三条准则选出：与承接方（mattpocock-skills）不重复、
 *   不侵入 instructions/verification/scope 三子系统、工程阶段真实净增量。
 *   其中 `api-and-interface-design` 是后补的复议项（原判为「部分邻接，可复议」）：
 *   本插件定位为通用工程补强，而接口契约是原 9 个完全空白的一域，
 *   零成本（同一上游仓）且不产生任何新增悬空引用。
 * B 组「引用闭包 5 个」——不按上述准则选（它们与承接方有重叠），而是**被 A 组正文
 *   直接引用**：不收进来，代理顺着 A 组的指示会去找一个不存在的技能。
 *   当前锁定的上游快照里共 11 处引用指向这 5 个。
 *
 * ── superpowers ──────────────────────────────────────────────────────────
 * C 组「承接空缺 5 个」——按本机实际安装的 mattpocock-skills 逐个核对，这 5 项
 *   在承接方侧没有对应技能，收进来补齐；superpowers 是内容来源，mattpocock 才是承接方。
 *   它们的正文不引用任何其它技能、不引用仓库级 references、无同目录附属文件，
 *   因此是一组天然自洽的收编（闭包 5/5，不产生悬空面）。
 */
const SOURCES = [
  {
    id: 'agent-skills',
    repo: 'addyosmani/agent-skills',
    license: 'MIT (Copyright (c) 2025 Addy Osmani)',
    /** 归档里必解的块；上游归档含符号链接（例如 .opencode/skills），Windows 的 tar 建不出来。 */
    requiredMembers: ['skills', 'LICENSE'],
    /** 解不出只提示不报错——该上游确实带 references/，缺失才会是意外。 */
    optionalMembers: ['references'],
    skills: [
      // A 组：精选 10 个
      'security-and-hardening',
      'performance-optimization',
      'frontend-ui-engineering',
      'browser-testing-with-devtools',
      'ci-cd-and-automation',
      'observability-and-instrumentation',
      'shipping-and-launch',
      'deprecation-and-migration',
      'constraint-driven-development',
      'api-and-interface-design',
      // B 组：被 A 组引用的 5 个（引用闭包）
      'debugging-and-error-recovery',
      'code-review-and-quality',
      'test-driven-development',
      'interview-me',
      'incremental-implementation',
    ],
    /** 技能正文以 ../../references/x.md 引用的仓库级共享清单，按 skill 单装会丢。 */
    sharedRefs: [
      'security-checklist.md',
      'performance-checklist.md',
      'accessibility-checklist.md',
      'observability-checklist.md',
      'definition-of-done.md',
      'testing-patterns.md',
    ],
    /** 上游根文件。两个上游都有 LICENSE，故按来源分目录存放，正文一律不改。 */
    rootFiles: [{ upstream: 'LICENSE', local: 'licenses/agent-skills-LICENSE' }],
  },
  {
    id: 'superpowers',
    repo: 'obra/superpowers',
    license: 'MIT (Copyright (c) 2025 Jesse Vincent)',
    requiredMembers: ['skills', 'LICENSE'],
    optionalMembers: [],
    skills: [
      'receiving-code-review',
      'verification-before-completion',
      'finishing-a-development-branch',
      'using-git-worktrees',
      'dispatching-parallel-agents',
    ],
    sharedRefs: [],
    rootFiles: [{ upstream: 'LICENSE', local: 'licenses/superpowers-LICENSE' }],
  },
];

/** 本包自写、同步脚本不接管的文件。 */
const UNMANAGED = [
  '.minimax-plugin/plugin.json',
  'icon.jpg',
  'icon-dark.jpg',
  'LICENSE',
  'upstream.lock.json',
  'README.md',
  'PROVENANCE.md',
  'scripts/update-upstream.mjs',
  'scripts/check-ref-table.mjs',
  'skills/using-harness-engineering-skills/SKILL.md',
  'scripts/check-package.mjs',
  'skills/old-code/SKILL.md',
  'skills/old-code/README.md',
  'skills/old-code/LICENSE',
  'skills/old-code/references/evidence-and-risk.md',
  'skills/old-code/references/learning-loop.md',
  'skills/old-code/evals/evals.json',
];

// 复制到安装目录时跳过的开发期文件
const SKIP_NAMES = new Set(['.git', '.gitignore', '.gitattributes', 'node_modules', '.scratch', '.DS_Store', 'Thumbs.db']);

// ---------------------------------------------------------------- CLI helpers

function parseArgs(argv) {
  const opts = { mode: null, ref: 'main', installDir: DEFAULT_INSTALL_DIR, only: null, force: false, keepTemp: false };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--check') opts.mode = 'check';
    else if (a === '--apply') opts.mode = 'apply';
    else if (a === '--install') opts.mode = 'install';
    else if (a === '--force') opts.force = true;
    else if (a === '--keep-temp') opts.keepTemp = true;
    else if (a === '--only') opts.only = argv[++i];
    else if (a === '--ref') opts.ref = argv[++i];
    else if (a === '--install-dir') opts.installDir = path.resolve(argv[++i]);
    else if (a === '--help' || a === '-h') opts.mode = 'help';
    else throw new Error(`未知参数：${a}`);
  }
  if (!opts.mode) throw new Error('必须指定 --check / --apply / --install 之一');
  if (opts.only && !SOURCES.some((s) => s.id === opts.only)) {
    throw new Error(`--only ${opts.only} 不是已登记的上游。可选：${SOURCES.map((s) => s.id).join(' / ')}`);
  }
  return opts;
}

const HELP = `用法：node scripts/update-upstream.mjs <模式> [参数]

模式
  --check        比对各上游 HEAD 与本地锁定版本，列出新增/变更/删除与本地漂移，不写任何文件
  --apply        拉取各上游目标 ref 的归档、镜像覆盖 vendored 文件、刷新 upstream.lock.json，
                 并把整个包镜像到安装目录
  --install      不联网，只把当前包镜像到安装目录

参数
  --only <id>    只处理一个上游（${SOURCES.map((s) => s.id).join(' / ')}）；其余源的锁条目原样保留
  --ref <b|t|s>  上游 ref，默认 main，对所有选中的上游生效；--apply 会先解析成具体 commit 再按 commit 下载。
                 指定 tag / 40 位 sha 时请一并加 --only——同一个 sha 不会存在于两个上游
  --install-dir  安装目录，默认 ~/.minimax/plugins/${PLUGIN_NAME}；不得是包本体自身或其上下级目录
  --force        忽略本地漂移告警强制覆盖（会丢弃本地对 vendored 文件的修改）
  --keep-temp    保留本次下载解包的临时目录，便于排查

安全边界
  --apply 是两阶段的：先把所有选中的上游都解析、下载、比对完，确认无漂移告警后才开始写文件。
  任何一步失败都在写盘之前中止，不会留下「文件已改、锁没更新」的半同步状态。
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
    else if (e.isFile()) out.push(relativePosix(full, base));
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

const relativePosix = (full, base) => path.relative(base, full).split(path.sep).join('/');

/** 每个受管分组：上游路径 → 本包路径（目录或单文件都支持）。 */
function managedGroups(src) {
  return [
    ...src.skills.map((s) => ({ id: `skills/${s}`, upstream: `skills/${s}`, local: `skills/${s}` })),
    ...src.sharedRefs.map((f) => ({ id: `references/${f}`, upstream: `references/${f}`, local: `references/${f}` })),
    ...src.rootFiles.map((f) => ({ id: f.local, upstream: f.upstream, local: f.local })),
  ];
}

/** 展开成本包内相对路径 → { localAbs, upstreamAbs } 的完整清单。 */
async function expandGroups(src, srcRoot) {
  const items = [];
  for (const g of managedGroups(src)) {
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

async function resolveRemoteSha(src, ref) {
  const repoUrl = `https://github.com/${src.repo}`;
  if (/^[0-9a-f]{40}$/i.test(ref)) return { sha: ref.toLowerCase(), via: '显式 commit' };
  const git = run('git', ['ls-remote', `${repoUrl}.git`, ref, 'HEAD']);
  if (git.ok) {
    for (const line of git.stdout.split('\n')) {
      const [sha, name] = line.trim().split(/\s+/);
      if (sha && name === 'HEAD') return { sha: sha.toLowerCase(), via: 'git ls-remote' };
    }
  }
  const res = await fetch(`https://api.github.com/repos/${src.repo}/commits/${ref}`, {
    headers: { 'User-Agent': `${PLUGIN_NAME}-sync`, Accept: 'application/vnd.github+json' },
  });
  if (!res.ok) throw new Error(`无法解析上游 ${src.repo} 的 ${ref}：git 不可用且 GitHub API 返回 ${res.status}`);
  const body = await res.json();
  if (!body.sha) throw new Error(`GitHub API 未返回 commit sha（${src.repo} @ ${ref}）`);
  return { sha: String(body.sha).toLowerCase(), via: 'GitHub API' };
}

async function downloadArchive(src, sha) {
  const tmp = path.join(os.tmpdir(), `${PLUGIN_NAME}-sync-${src.id}-${process.pid}-${Date.now()}`);
  await fs.mkdir(tmp, { recursive: true });
  // 失败路径自己清：否则 fetch 一抛错，调用方的 try/finally 还没接住，临时目录会留在 os.tmpdir() 里
  try {
    const tgz = path.join(tmp, 'upstream.tar.gz');
    const url = `https://codeload.github.com/${src.repo}/tar.gz/${sha}`;
    say(`  下载 ${url}`);
    const res = await fetch(url, { headers: { 'User-Agent': `${PLUGIN_NAME}-sync` } });
    if (!res.ok) {
      // 不消费响应体就抛，node 退出时可能触发 libuv 断言，把干净的 exit 1 盖成 -1073740791
      await res.body?.cancel().catch(() => {});
      throw new Error(`下载失败：HTTP ${res.status} ${url}`);
    }
    await fs.writeFile(tgz, Buffer.from(await res.arrayBuffer()));

    const listing = run('tar', ['-tzf', tgz]);
    if (!listing.ok) {
      if (listing.missing) throw new Error('系统缺少 tar 命令，无法解包上游归档（Windows 10+ 自带 tar.exe）');
      throw new Error(`读取归档清单失败：${listing.stderr.trim()}`);
    }
    const firstEntry = listing.stdout.split('\n').map((s) => s.trim()).find(Boolean);
    if (!firstEntry) throw new Error('上游归档为空');
    const rootName = firstEntry.split('/')[0];

    for (const member of src.requiredMembers) {
      const untar = run('tar', ['-xzf', tgz, '-C', tmp, `${rootName}/${member}`]);
      if (!untar.ok) {
        if (untar.missing) throw new Error('系统缺少 tar 命令，无法解包上游归档（Windows 10+ 自带 tar.exe）');
        throw new Error(`解包 ${src.repo} 的 ${member} 失败：${untar.stderr.trim()}`);
      }
    }
    for (const member of src.optionalMembers) {
      const untar = run('tar', ['-xzf', tgz, '-C', tmp, `${rootName}/${member}`]);
      if (!untar.ok) warn(`  提示：${src.repo} 归档中解不出 ${member}，已跳过`);
    }

    const srcRoot = path.join(tmp, rootName);
    if (!(await exists(path.join(srcRoot, 'skills')))) throw new Error(`解包结果异常：${src.repo} 缺少 skills 目录`);
    if (!(await exists(path.join(srcRoot, 'LICENSE')))) throw new Error(`解包结果异常：${src.repo} 缺少 LICENSE（许可声明必须一起带走）`);
    return { tmp, srcRoot };
  } catch (e) {
    await fs.rm(tmp, { recursive: true, force: true });
    throw e;
  }
}

// ---------------------------------------------------------------- 锁文件

/** 锁格式版本。1 = 单上游（flat managed），2 = per-source。 */
const LOCK_FORMAT = 2;

async function readLock() {
  try { return JSON.parse(await fs.readFile(LOCK_FILE, 'utf8')); } catch { return null; }
}

/** 取某一上游的锁条目；旧格式锁返回 null。 */
function lockFor(lock, sourceId) {
  if (!lock || lock.lockFormat !== LOCK_FORMAT || !lock.sources) return null;
  return lock.sources[sourceId] ?? null;
}

function buildLockEntry(src, ref, sha, managed) {
  return {
    repo: src.repo,
    repoUrl: `https://github.com/${src.repo}`,
    license: src.license,
    upstreamRef: ref,
    commit: sha,
    syncedAt: new Date().toISOString(),
    archiveMembers: { required: src.requiredMembers, optional: src.optionalMembers },
    skills: src.skills,
    sharedRefs: src.sharedRefs,
    rootFiles: src.rootFiles,
    managed,
  };
}

async function writeLock(sourcesMap) {
  const lock = {
    plugin: PLUGIN_NAME,
    lockFormat: LOCK_FORMAT,
    syncedAt: new Date().toISOString(),
    policy: 'vendored 文件零本地改写；未出现在任何源的 managed 中的路径由本包自行维护，同步脚本不接管。',
    sources: sourcesMap,
    unmanaged: UNMANAGED,
  };
  await fs.writeFile(LOCK_FILE, `${JSON.stringify(lock, null, 2)}\n`, 'utf8');
  return lock;
}

// ---------------------------------------------------------------- 漂移检测

async function detectDrift(srcLock) {
  const drifted = [];
  const missing = [];
  const eolOnly = [];
  for (const [rel, meta] of Object.entries(srcLock.managed ?? {})) {
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

async function planChanges(src, srcRoot) {
  const upstream = await expandGroups(src, srcRoot);
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

  // 本包里存在、该上游已删除的受管文件
  const localManaged = new Set();
  for (const g of managedGroups(src)) {
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
  const managed = {};
  let written = 0;
  let removed = 0;
  for (const r of rows) {
    if (r.status === 'REMOVE') { await fs.rm(r.localAbs); removed += 1; continue; }
    if (r.status === 'SAME') {
      const cur = await sha256File(r.localAbs);
      managed[r.rel] = { sha256: cur.sha256, bytes: cur.bytes };
      continue;
    }
    await fs.mkdir(path.dirname(r.localAbs), { recursive: true });
    await fs.copyFile(r.upstreamAbs, r.localAbs);
    managed[r.rel] = { sha256: r.upstream.sha256, bytes: r.upstream.bytes };
    written += 1;
  }
  return { managed, written, removed };
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
    else if (e.isFile()) out.push(relativePosix(full, base));
  }
  return out;
}

/** child 是否位于 parent 之内（不含相等）。 */
function isInside(parent, child) {
  const rel = path.relative(path.resolve(parent), path.resolve(child));
  return rel !== '' && !rel.startsWith('..') && !path.isAbsolute(rel);
}

/**
 * 收集 root 下所有子目录，按路径长度降序——深的在前。
 * 只用于清理「删完文件后变空的目录」，长度倒序近似深度倒序，足够把嵌套空壳逐层删净。
 */
async function collectDirs(root) {
  const out = [];
  async function walk(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      if (!e.isDirectory()) continue;
      const p = path.join(dir, e.name);
      out.push(p);
      await walk(p);
    }
  }
  await walk(root);
  return out.sort((a, b) => b.length - a.length);
}

async function mirrorToInstall(installDir) {
  // 包本体与安装目录互相嵌套都会自毁：安装目录=包本体时，下面会先清空包本体再从空目录复制 0 个文件；
  // 安装目录在包本体之内时 collectPackageFiles 会递归进自己。
  if (path.resolve(installDir) === PKG_ROOT) {
    throw new Error(`拒绝写入：安装目录不能是包本体自身（${PKG_ROOT}）——那会先把包清空再复制 0 个文件`);
  }
  if (isInside(PKG_ROOT, installDir)) {
    throw new Error(`拒绝写入：安装目录 ${installDir} 位于包本体 ${PKG_ROOT} 之内`);
  }
  if (isInside(installDir, PKG_ROOT)) {
    throw new Error(`拒绝写入：安装目录 ${installDir} 是包本体 ${PKG_ROOT} 的上级目录，清它会连带清掉包本体`);
  }

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
    for (const rel of current) await fs.rm(path.join(installDir, ...rel.split('/')), { force: true });
    // 上游删技能、或本地给技能改过名时，旧目录会留下一个空壳。rmdir 只能删空目录，
    // 仍非空的会报 ENOTEMPTY——那正是我们要的行为，不用 --force 硬删。
    for (const dir of await collectDirs(installDir)) {
      try {
        await fs.rmdir(dir);
      } catch (e) {
        if (e.code !== 'ENOTEMPTY' && e.code !== 'ENOENT' && e.code !== 'EEXIST') throw e;
      }
    }
  }
  await fs.mkdir(installDir, { recursive: true });
  const files = await collectPackageFiles(PKG_ROOT);
  for (const rel of files) {
    const dest = path.join(installDir, ...rel.split('/'));
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await fs.copyFile(path.join(PKG_ROOT, ...rel.split('/')), dest);
  }
  return files.length;
}

// ---------------------------------------------------------------- 单个上游的处理

/**
 * 阶段一：解析 → 下载 → 比对 → 漂移检查。**只读，不写盘。**
 * 返回该上游的待应用计划；apply 模式下 srcRoot 会一直保留到阶段二结束。
 */
async function planSource(src, opts, srcLock) {
  say(`→ 上游 ${src.id}  ${src.repo} @ ${opts.ref}`);
  const { sha, via } = await resolveRemoteSha(src, opts.ref);
  say(`  commit ${sha}（${via}）`);
  const behind = !srcLock || srcLock.commit !== sha;
  say(`  本地锁定 ${srcLock ? srcLock.commit.slice(0, 12) : '（无）'} → ${behind ? '有更新' : '已是最新'}`);

  say('  下载归档…');
  const { tmp, srcRoot } = await downloadArchive(src, sha);

  let rows;
  try {
    rows = await planChanges(src, srcRoot);
  } catch (e) {
    if (!opts.keepTemp) await fs.rm(tmp, { recursive: true, force: true });
    throw e;
  }

  const changed = rows.filter((r) => r.status !== 'SAME');
  say('');
  printRows(rows);
  say('');
  const countOf = (s) => rows.filter((r) => r.status === s).length;
  say(`  合计 ${rows.length} 个受管文件：${countOf('SAME')} 未变、${countOf('UPDATE')} 变更、` +
    `${countOf('NEW')} 新增、${countOf('EOL')} 仅换行符差异、${countOf('REMOVE')} 上游已删除`);

  let drift = { drifted: [], missing: [], eolOnly: [] };
  if (srcLock) {
    drift = await detectDrift(srcLock);
    if (drift.eolOnly.length) {
      say(`  ℹ ${drift.eolOnly.length} 处仅换行符差异（内容未改，多为 CRLF↔LF），不视为本地改动；`);
      say('    --apply 会按上游 LF 覆盖修复，仓库已用 .gitattributes 固定 LF 避免复发。');
    }
    if (drift.drifted.length || drift.missing.length) {
      warn('');
      warn(`⚠ 本地漂移 ${drift.drifted.length + drift.missing.length} 处（本地改过 vendored 文件，会在同步时被覆盖）：`);
      for (const d of drift.drifted) warn(`   ~ ${d.rel}  ${d.from} → ${d.to}`);
      for (const rel of drift.missing) warn(`   - ${rel}  本地缺失`);
      if (opts.mode === 'apply' && !opts.force) {
        if (!opts.keepTemp) await fs.rm(tmp, { recursive: true, force: true });
        throw new Error(`已中止（${src.id}）：先确认要丢弃这些本地改动，加 --force 覆盖，或先手工处理。`);
      }
    } else {
      say('  本地漂移 0 处（vendored 文件与锁定版本一致）');
    }
  } else {
    say('  本地无该上游的锁定条目（首次收编或锁为旧格式），漂移检测跳过');
  }

  const stats = { id: src.id, total: rows.length, changed: changed.length, ...drift };
  return { src, sha, rows, srcRoot, tmp, stats, entry: null };
}

/** 阶段二：把计划落到磁盘。 */
async function applyPlan(plan, opts) {
  const { managed, written, removed } = await applyRows(plan.rows);
  plan.stats.written = written;
  plan.stats.removed = removed;
  plan.entry = buildLockEntry(plan.src, opts.ref, plan.sha, managed);
  say(`✓ 写入 ${written} 个、清理 ${removed} 个`);
  return plan;
}

// ---------------------------------------------------------------- 主流程

async function main() {
  let opts;
  try { opts = parseArgs(process.argv.slice(2)); } catch (e) { warn(`✗ ${e.message}`); say(HELP); process.exit(2); }
  if (opts.mode === 'help') { say(HELP); return; }

  const lock = await readLock();
  const legacyLock = Boolean(lock) && lock.lockFormat !== LOCK_FORMAT;

  if (opts.mode === 'install') {
    say('→ 镜像到安装目录（不联网）');
    const n = await mirrorToInstall(opts.installDir);
    say(`✓ 已安装 ${n} 个文件：${opts.installDir}`);
    if (!lock) warn('! 没有 upstream.lock.json，建议先跑一次 --apply 建立锁定版本');
    return;
  }

  if (legacyLock) {
    if (opts.only) {
      throw new Error('锁文件是旧的单上游格式，--only 无法保留其它上游的条目。请先跑一次不带 --only 的 --apply 重建。');
    }
    warn(`! upstream.lock.json 是旧的单上游格式，本次将重建为 ${SOURCES.length} 源结构（lockFormat=${LOCK_FORMAT}）。`);
  }

  const targets = opts.only ? SOURCES.filter((s) => s.id === opts.only) : SOURCES;
  const plans = [];
  try {
    // 阶段一：所有选中的上游全部解析/下载/比对完，任何一步失败都在写盘前中止
    for (const src of targets) plans.push(await planSource(src, opts, lockFor(lock, src.id)));

    const allStats = plans.map((p) => p.stats);
    const managedTotal = allStats.reduce((n, s) => n + s.total, 0);
    const changedTotal = allStats.reduce((n, s) => n + s.changed, 0);
    const driftTotal = allStats.reduce((n, s) => n + s.drifted.length + s.missing.length, 0);

    if (opts.mode === 'check') {
      say(`结论：${targets.length} 个上游 / ${managedTotal} 个受管文件，${changedTotal} 处变化，漂移 ${driftTotal} 处；--check 未写任何文件。`);
      return;
    }

    // 阶段二：统一落盘
    say('→ 镜像覆盖 vendored 文件');
    for (const plan of plans) await applyPlan(plan, opts);
    say('');

    // 未同步的源沿用旧条目；旧格式锁没有可沿用的内容
    const sourcesMap = {};
    for (const src of SOURCES) {
      const fresh = plans.find((p) => p.src.id === src.id);
      if (fresh?.entry) { sourcesMap[src.id] = fresh.entry; continue; }
      const carried = lockFor(lock, src.id);
      if (carried) { sourcesMap[src.id] = carried; continue; }
      warn(`! 锁里找不到上游 ${src.id} 的条目，本次不会写入它（该源的 vendored 文件保持现状）`);
    }
    // 先写锁再镜像：锁描述的是「包本体」的真相，而包本体此刻已经改完了；
    // 反过来（镜像成功才写锁）一旦镜像失败，磁盘上的文件已变而锁还停在旧 sha，
    // 下一次 --check 会把「脚本自己刚写的文件」误报成本地漂移、逼你加 --force。
    await writeLock(sourcesMap);
    say(`✓ upstream.lock.json 已更新（lockFormat=${LOCK_FORMAT}，${Object.keys(sourcesMap).length} 个上游）`);

    try {
      say('→ 镜像到安装目录');
      const n = await mirrorToInstall(opts.installDir);
      say(`✓ 已安装 ${n} 个文件：${opts.installDir}`);
    } catch (e) {
      throw new Error(`${e.message}\n  注意：包本体已同步完成、锁已更新，只有安装目录还是旧的。重跑\n` +
        `  node scripts/update-upstream.mjs --install 即可，不必再 --apply。`);
    }
    say('');
    say('提示：MiniMax Code 的本地插件自动重扫可能需要几秒；若未刷新，重启一次客户端。');
  } finally {
    for (const p of plans) {
      if (opts.keepTemp) warn(`临时目录已保留：${p.tmp}`);
      else await fs.rm(p.tmp, { recursive: true, force: true });
    }
  }
}

main().catch((e) => {
  warn(`✗ ${e.message}`);
  process.exit(1);
});
