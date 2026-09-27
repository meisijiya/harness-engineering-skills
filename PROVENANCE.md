# PROVENANCE · 来源与选型记录

本插件是一份**精选再分发包**：内容来自第三方开源仓库，主体文件为上游逐字节副本。

## 1. 上游

| 项 | 值 |
|---|---|
| 仓库 | https://github.com/addyosmani/agent-skills |
| 锁定 ref | `main` |
| 锁定 commit | `2686b620fc1fed2e8f60c704839c766b8594c6b6` |
| 许可 | **MIT**，Copyright (c) 2025 Addy Osmani（全文见本包 `LICENSE`） |
| 逐文件校验 | 见 `upstream.lock.json` 的 `managed`（每个文件一个 sha256） |

`skills/` 下这 15 个目录与 `references/` 下 6 份共享清单，**均为上游字节级副本，零本地改写**。

## 1b. 本包的定位边界

本插件是 **`/implement` 阶段（执行工单时）的通用工程补强**，与 `harness-creator` 的承接方配合使用。

**收录标准：与语言、框架、数据库无关的通用能力。**
栈相关技能（LangChain4j、Postgres 专属规则集、具体框架调优）**一律不入本包**，
随项目按需安装——否则插件会迅速臃肿，且栈相关内容的保质期远短于通用工程纪律。

## 2. 本包自写（不在上游，同步脚本不接管）

| 路径 | 作用 |
|---|---|
| `.minimax-plugin/plugin.json` | MiniMax 本地插件清单 |
| `icon.jpg` / `icon-dark.jpg` | 本包专用图标（浅色/深色两版分别生成，非内置资源池）：顶梁 + 三柱 + 基座构成的「门禁闸门」几何标记，避开 `</>` 类代码字形 |
| `upstream.lock.json` | 上游 commit + 逐文件 sha256 锁 |
| `scripts/update-upstream.mjs` | 上游同步 / 安装镜像脚本 |
| `skills/harness-engineering-skills-index/SKILL.md` | 纯索引：分组、路由、承接方优先级、悬空引用映射 |
| `README.md` / `PROVENANCE.md` | 本文件与使用说明 |

## 3. 收录分两组，依据不同

### A 组 · 精选 10 个（按三条准则）

准则来自 `harness-creator` 仓内既有规则：
1. **不重复承接方已有能力**——重复即争触发时机；
2. **不侵入 instructions / verification / scope 三个子系统**；
3. **必须是工程阶段的真实净增量**。

`security-and-hardening`、`performance-optimization`、`frontend-ui-engineering`、
`browser-testing-with-devtools`、`ci-cd-and-automation`、`observability-and-instrumentation`、
`shipping-and-launch`、`deprecation-and-migration`、`constraint-driven-development`

**复议补录 1 个**：`api-and-interface-design`

它原本被判为「部分邻接，可复议」（邻接承接方的领域建模 / 接口边界）。复议通过的理由：
本包定位是 `/implement` 阶段的通用补强，而**接口契约是原 9 个完全空白的一域**——
14 个技能里没有任何一个做 REST / GraphQL 端点设计、模块边界或模块间类型契约。
成本为零（同一上游仓，改一行清单），且实测**不产生任何新增悬空引用**
（它只引用 `deprecation-and-migration`，已在包内）、不需要新增共享清单。

### B 组 · 引用闭包 5 个（**不按**上述准则）

`debugging-and-error-recovery`、`code-review-and-quality`、`test-driven-development`、
`interview-me`、`incremental-implementation`

收录依据只有一个：**A 组正文直接引用它们**。不收进来，代理顺着 A 组的指示会去找不存在的技能。
A 组 9 个的正文共 11 处引用指向这 5 个（`debugging-and-error-recovery` 3 处、
`code-review-and-quality` 3 处、`test-driven-development` 2 处、`interview-me` 2 处、
`incremental-implementation` 1 处）。

代价是明确的：这 5 个与承接方（superpowers / mattpocock）功能重叠，会重新引入触发时机竞争。
`harness-engineering-skills-index` 因此写明**承接方优先、B 组兜底**。

## 4. 引用闭包只收一跳

A 组 10 个的**传递**引用闭包经实测为 **22 / 25**：

| 跳数 | 新增 | 累计 |
|---|---|---|
| 第 1 跳 | +5（B 组） | 15 |
| 第 2 跳 | +6 `doubt-driven-development`、`git-workflow-and-versioning`、`idea-refine`、`planning-and-task-breakdown`、`source-driven-development`、`spec-driven-development` | 21 |
| 第 3 跳 | +1 `context-engineering` | 22 |

收满等于基本搬平整仓，且会带入 `context-engineering`——它争 harness-creator 的 instructions 子系统，
且与 harness-creator 自带的 `references/context-engineering-pattern.md` **同名不同域**，是已登记的雷。

**决定：只收一跳。** 第 2 跳的 6 处引用改由 `harness-engineering-skills-index` 的
「悬空引用映射表」解析到实际承接方，并按性质区分：

- **真流程缺口 2 处**（缺了会动作落空）：`interview-me:129` 用 `spec-driven-development` 起草规格
  → `to-spec`；`incremental-implementation:41` 原子提交指引 → `finishing-a-development-branch` / `using-git-worktrees`
- **交接落点 2 处**：`idea-refine`、`spec-driven-development` → `grilling` / `to-spec`
- **仅对照说明 3 处**：`planning-and-task-breakdown`、`doubt-driven-development`、`source-driven-development`
  → `to-tickets` / `code-review` / `research`，缺了只损失解释力

因此**本包不承诺上游引用闭包完整**，这是有意识的取舍，不是遗漏。

## 5. 未收录的上游技能（10 / 25）

- **完全重叠**（承接方已覆盖）：`idea-refine`、`spec-driven-development`、`planning-and-task-breakdown`、
  `incremental-implementation`※、`test-driven-development`※、`debugging-and-error-recovery`※、
  `code-review-and-quality`※、`source-driven-development`、`git-workflow-and-versioning`、
  `documentation-and-adrs`（※ = 已作为 B 组收录，功能上仍以承接方为主）
- **部分邻接，可复议**：`code-simplification`、`doubt-driven-development`
- **抢 harness-creator 领地**：`context-engineering`（争 instructions 子系统 + 同名不同域）、
  `using-agent-skills`（第二套路由）

**刻意留在项目层的领域**（生态有货但绑栈，按第 1b 节的边界不入本包）：
`llm-application-dev` 七件套（技术层通用、但与 LangChain 生态绑定更划算）、`supabase-postgres-best-practices`（Postgres 专属）、
各类语言绑定的开发插件。

**未纳入本包的上游资产**：9 个 slash command（`commands/*.toml`）与 4 个 subagent（`agents/*.md`）。
它们不在 `skills/` 目录下，MiniMax 本地插件格式也不支持这两种能力；需要时从上游取用。

## 6. 修掉的上游可移植性缺口

上游按单 skill 安装只复制 `skills/<name>/`，**不带仓库级 `references/`**，于是技能正文里的
相对引用会指空。本包把被引用的 6 份共享清单放进包根 `references/`——因为插件布局是
`skills/<name>/SKILL.md`，从技能目录向上两级恰好是包根，**该相对路径天然成立，正文一个字都不用改**。
这既是"可用"的修复，也是"可一键覆盖更新"的前提。

被补齐的 6 份：`security-checklist.md`、`performance-checklist.md`、`accessibility-checklist.md`、
`observability-checklist.md`、`definition-of-done.md`、`testing-patterns.md`
（上游另有 `orchestration-patterns.md`，只被未收录的技能引用，本包不带。）

## 7. 与你先前那份整仓副本的差异

原 `plugins/agent-skills` 是上游整仓 v0.6.10 的本地副本，**落后于上游 HEAD**：它缺
`skills/security-and-hardening/references/hardening-patterns.md`，且 `references/security-checklist.md`
为 14,034 B（上游 14,360 B）。本包的内容全部从上游 HEAD 重新拉取，不沿用那份副本。

## 8. 维护规则

- 不要在本地改写 `skills/` 下这 14 个目录与 `references/`。`--apply` 会检测漂移并默认拒绝覆盖。
- 要加本地增补，另建目录并登记进 `upstream.lock.json` 的 `unmanaged`。
- **新增收录技能时，先用引用扫描确认它的二跳引用**：只加一跳是本包的既定取舍，
  二跳引用应进索引的映射表，而不是继续 vendored。
- 同步后请复核 `PROVENANCE.md` 中的 commit 与 `upstream.lock.json` 是否一致。
