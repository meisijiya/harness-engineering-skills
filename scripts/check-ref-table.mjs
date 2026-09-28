#!/usr/bin/env node
/**
 * check-ref-table.mjs — 逐行对账 `skills/harness-engineering-skills-index/SKILL.md` 附录 C 的
 * 「共享清单被谁引用」表，与各技能 SKILL.md 正文里的**实际引用**是否一致。
 *
 * 为什么需要它：那张表一旦写成「文件名 → 引用方」的对照形式，就从描述升级为断言——
 * 读者会照着它增删 `references/`。而它从 v1.2.0 起就少列了 3 处真实引用
 * （code-review-and-quality 引 security-/performance-checklist.md，
 *   incremental-implementation 引 definition-of-done.md），
 * 人眼跨三个版本都没发现，直到被 3 个独立 judge 同时指出。
 *
 * 用法：
 *   node scripts/check-ref-table.mjs            # 有不一致则 exit 1
 *   node scripts/check-ref-table.mjs --verbose  # 额外打印每行实际引用方
 *
 * 改了 `references/` 清单、或新增/删除技能后，请重跑本脚本再提交。
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const PKG_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKILLS_DIR = path.join(PKG_ROOT, 'skills');
const INDEX_FILE = path.join(SKILLS_DIR, 'harness-engineering-skills-index', 'SKILL.md');
const REF_DIR = path.join(PKG_ROOT, 'references');

/** 表里应当出现的共享清单。顺序即文档里的顺序。 */
const REFS = [
  'security-checklist.md',
  'performance-checklist.md',
  'accessibility-checklist.md',
  'observability-checklist.md',
  'definition-of-done.md',
  'testing-patterns.md',
];

const verbose = process.argv.includes('--verbose');

if (!fs.existsSync(REF_DIR)) {
  process.stderr.write(`✗ 找不到 ${REF_DIR}\n`);
  process.exit(2);
}

// 磁盘上实际存在的清单 vs 脚本期望清单
const onDisk = fs.readdirSync(REF_DIR).filter((f) => f.endsWith('.md')).sort();
const missingOnDisk = REFS.filter((f) => !onDisk.includes(f));
const extraOnDisk = onDisk.filter((f) => !REFS.includes(f));

// 索引自身不算引用方——表里就写着这些文件名，会把自己也扫进去
const dirs = fs.readdirSync(SKILLS_DIR, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name)
  .filter((n) => n !== 'harness-engineering-skills-index');

const indexText = fs.readFileSync(INDEX_FILE, 'utf8');
let bad = missingOnDisk.length + extraOnDisk.length;

if (missingOnDisk.length) {
  console.log(`  MISSING  ${missingOnDisk.join(' / ')} —— 脚本期望的清单在 references/ 里不存在`);
}
if (extraOnDisk.length) {
  console.log(`  EXTRA    ${extraOnDisk.join(' / ')} —— references/ 里有本脚本未登记的清单`);
  for (const f of extraOnDisk) {
    const users = dirs.filter((d) => fs.readFileSync(path.join(SKILLS_DIR, d, 'SKILL.md'), 'utf8').includes(`references/${f}`));
    console.log(`             被引用方: ${users.join(' / ') || '（无人引用）'}`);
  }
}

for (const ref of REFS) {
  if (missingOnDisk.includes(ref)) continue;

  const actual = dirs
    .filter((d) => fs.readFileSync(path.join(SKILLS_DIR, d, 'SKILL.md'), 'utf8').includes(`references/${ref}`))
    .sort();

  const row = new RegExp(`^\\|[^|]*references/${ref.replace('.', '\\.')}[^|]*\\|([^|]*)\\|`, 'm').exec(indexText);
  if (!row) {
    console.log(`  NO-ROW   ${ref} —— 索引附录 C 里没有这一行`);
    bad += 1;
    continue;
  }

  const listed = (row[1].match(/`([a-z-]+)`/g) || []).map((s) => s.replace(/`/g, '')).sort();
  const ok = JSON.stringify(actual) === JSON.stringify(listed);
  if (!ok) bad += 1;

  if (ok && verbose) console.log(`  OK       ${ref.padEnd(28)} ${actual.join(' / ')}`);
  else if (ok) console.log(`  OK       ${ref}`);
  else {
    console.log(`  MISMATCH ${ref}`);
    console.log(`             表: ${listed.join(' / ') || '（空）'}`);
    console.log(`             实: ${actual.join(' / ') || '（无人引用）'}`);
  }
}

console.log(bad === 0
  ? `\n✓ 共享清单引用表与正文一致（${REFS.length} 行逐行通过）`
  : `\n✗ ${bad} 处不一致——修好后重跑`);

process.exit(bad === 0 ? 0 : 1);
