# PROVENANCE · 来源与选型记录

本插件是一份**精选再分发包**：内容来自第三方开源仓库，主体文件为上游逐字节副本。

## 1. 上游

| 项 | 值 |
|---|---|
| 仓库 | https://github.com/addyosmani/agent-skills |
| 锁定 ref | `main` |
| 锁定 commit | `2686b620fc1fed2e8f60c704839c766b8594c6b6` |
| 同步时间 | 2026-09-27T13:40:20Z |
| 许可 | **MIT**，Copyright (c) 2025 Addy Osmani（全文见本包 `LICENSE`） |
| 逐文件校验 | 见 `upstream.lock.json` 的 `managed`（每个文件一个 sha256） |

`skills/` 下这 9 个目录与 `references/` 下 5 份共享清单，**均为上游字节级副本，零本地改写**。

## 2. 本包自写（不在上游，同步脚本不接管）

| 路径 | 作用 |
|---|---|
| `.minimax-plugin/plugin.json` | MiniMax 本地插件清单 |
| `icon.jpg` / `icon-dark.jpg` | 本包专用图标（浅色/深色两版分别生成，非内置资源池）：顶梁 + 三柱 + 基座构成的「门禁闸门」几何标记，避开 `</>` 类代码字形 |
| `upstream.lock.json` | 上游 commit + 逐文件 sha256 锁 |
| `scripts/update-upstream.mjs` | 上游同步 / 安装镜像脚本 |
| `skills/harness-engineering-skills-index/SKILL.md` | 纯索引：9 个技能何时用哪个 |
| `README.md` / `PROVENANCE.md` | 本文件与使用说明 |

## 3. 为什么只取 9 / 25

判定准则三条，均来自 `harness-creator` 仓内既有规则：

1. **不重复承接方已有能力** —— 重复即争触发时机；
2. **不侵入 instructions / verification / scope 三个子系统**；
3. **必须是工程阶段的真实净增量**。

**采纳 9 个**

`security-and-hardening`、`performance-optimization`、`frontend-ui-engineering`、
`browser-testing-with-devtools`、`ci-cd-and-automation`、`observability-and-instrumentation`、
`shipping-and-launch`、`deprecation-and-migration`、`constraint-driven-development`

**未采纳 16 个**

- 完全重叠（11）：`interview-me`、`idea-refine`、`spec-driven-development`、
  `planning-and-task-breakdown`、`incremental-implementation`、`test-driven-development`、
  `debugging-and-error-recovery`、`code-review-and-quality`、`git-workflow-and-versioning`、
  `documentation-and-adrs`、`source-driven-development`
- 部分邻接（3，可复议）：`api-and-interface-design`、`code-simplification`、`doubt-driven-development`
- 抢 harness-creator 领地（2）：`context-engineering`（争 instructions 子系统，且与其
  `references/context-engineering-pattern.md` 同名不同域）、`using-agent-skills`（第二套路由）

**未纳入本包的上游资产**：9 个 slash command（`commands/*.toml`）与 4 个 subagent（`agents/*.md`）。
它们不在 `skills/` 目录下，MiniMax 本地插件格式也不支持这两种能力；需要时从上游取用。

## 4. 修掉的上游可移植性缺口

上游按单 skill 安装只复制 `skills/<name>/`，**不带仓库级 `references/`**，于是技能正文里的
`../../references/x.md` 会指空。本包把被引用的 5 份共享清单放进包根 `references/`——因为插件布局
是 `skills/<name>/SKILL.md`，`../../references/x.md` 恰好解析到 `<包根>/references/x.md`，
**所以一个字都不用改正文**。这既是"可用"的修复，也是"可一键覆盖更新"的前提。

被补齐的 5 份：`security-checklist.md`、`performance-checklist.md`、`accessibility-checklist.md`、
`observability-checklist.md`、`definition-of-done.md`
（上游另有 `orchestration-patterns.md`、`testing-patterns.md`，只被未采纳的技能引用，本包不带。）

## 5. 与你先前那份整仓副本的差异

原 `plugins/agent-skills` 是上游整仓 v0.6.10 的本地副本，**落后于上游 HEAD**：它缺
`skills/security-and-hardening/references/hardening-patterns.md`，且 `references/security-checklist.md`
为 14,034 B（上游 14,360 B）。本包的内容全部从上游 HEAD 重新拉取，不沿用那份副本。

## 6. 维护规则

- 不要在本地改写 `skills/` 下这 9 个目录与 `references/`。`--apply` 会检测漂移并默认拒绝覆盖。
- 要加本地增补，另建目录并登记进 `upstream.lock.json` 的 `unmanaged`。
- 同步后请复核 `PROVENANCE.md` 中的 commit 与 `upstream.lock.json` 是否一致。
