# PROVENANCE · 来源与选型记录

本插件是一份**精选再分发包**：内容来自第三方开源仓库，主体文件为上游逐字节副本。

## 1. 上游（两个）

| 项 | 上游 A | 上游 B |
|---|---|---|
| 仓库 | https://github.com/addyosmani/agent-skills | https://github.com/obra/superpowers |
| 锁定 ref | `main` | `main` |
| 锁定 commit | `2686b620fc1fed2e8f60c704839c766b8594c6b6` | `8ca22dba9a94f28898bbce59f2537ff4d87c747d` |
| 许可 | **MIT**，Copyright (c) 2025 Addy Osmani | **MIT**，Copyright (c) 2025 Jesse Vincent |
| 许可全文 | `licenses/agent-skills-LICENSE` | `licenses/superpowers-LICENSE` |
| 收录 | 15 个技能 + 6 份共享清单（24 个文件） | 5 个技能（6 个文件，含许可） |
| 组 | A 组 10 + B 组 5 | C 组 5 |
| 逐文件校验 | `upstream.lock.json` → `sources["agent-skills"].managed` | `upstream.lock.json` → `sources.superpowers.managed` |

所有 vendored 内容**均为上游字节级副本，零本地改写**，逐文件一个 sha256 记录在 `upstream.lock.json` 的
`sources.<id>.managed` 里；`sources.<id>.commit` 锁定各上游的具体版本。两个上游各解归档一次，
不共享临时目录。

## 1b. 本包的定位边界

本插件是 **`mattpocock-skills` 在 `harness-creator` 治理下的能力补强**：
补上它没有的**通用工程能力**，不接管它的流程主导权。

机器口径（按本机实际安装的两个插件目录实测，非上游 README）：

| 比对项 | 结果 |
|---|---|
| 本包 vendored 技能 | 20 |
| 本机 mattpocock-skills 技能 | 25 |
| **两者同名重叠** | **0** |
| 本机 superpowers 技能 | 14，与本包同名 6 个（C 组 5 + B 组 `test-driven-development`） |

「补强」不是修辞：这 20 个技能在 mattpocock 侧一个都没有对应项，不存在抢触发时机的问题。
需求对齐、规格、拆单、实现、测试、发起评审的主导权仍在 mattpocock，本包不引入第二套流程入口。

**收录标准：与语言、框架、数据库无关的通用能力。**
栈相关技能（LangChain4j、Postgres 专属规则集、具体框架调优）**一律不入本包**，
随项目按需安装——否则插件会迅速臃肿，且栈相关内容的保质期远短于通用工程纪律。

## 1c. 许可与再分发

两个上游都是 MIT，**都要求随包附带版权声明与许可全文**。本包的处理：

- 两份许可全文**逐字节** vendored 到 `licenses/agent-skills-LICENSE` 与 `licenses/superpowers-LICENSE`，
  按来源分目录存放（`rootFiles` 映射：上游 `LICENSE` → 本包 `licenses/<id>-LICENSE`），
  正文一字未改。
- 根目录 `LICENSE` 是**本包自写**的许可说明：第一节声明自写部分（manifest、图标、脚本、索引、文档）
  的 MIT；第二节列出两个上游的归属与许可全文路径。根目录**不**放单一上游的许可全文——
  那样读起来像是覆盖全包，实际只覆盖一部分，属于归属误读。
- 逐文件归属的机器可读版本是 `upstream.lock.json` 的 `sources.<id>.managed`。

## 2. 本包自写（不在上游，同步脚本不接管）

登记在 `upstream.lock.json` 的 `unmanaged`：

| 路径 | 作用 |
|---|---|
| `.minimax-plugin/plugin.json` | MiniMax 本地插件清单 |
| `icon.jpg` / `icon-dark.jpg` | 本包专用图标（浅色/深色两版分别生成，非内置资源池）：顶梁 + 三柱 + 基座构成的「门禁闸门」几何标记，避开 `</>` 类代码字形 |
| `LICENSE` | 双源许可说明（见 1c） |
| `upstream.lock.json` | 两个上游的 commit + 逐文件 sha256 锁 |
| `scripts/update-upstream.mjs` | 双上游同步 / 安装镜像脚本 |
| `skills/harness-engineering-skills-index/SKILL.md` | 纯索引：分组、路由、承接方优先级、悬空引用映射、宿主适配 |
| `README.md` / `PROVENANCE.md` | 本文件与使用说明 |

## 3. 收录分三组，依据各不相同

### A 组 · 精选 10 个（addyosmani/agent-skills，按三条准则）

准则来自 `harness-creator` 仓内既有规则：
1. **不重复承接方已有能力**——重复即争触发时机；
2. **不侵入 instructions / verification / scope 三个子系统**；
3. **必须是工程阶段的真实净增量**。

`security-and-hardening`、`performance-optimization`、`frontend-ui-engineering`、
`browser-testing-with-devtools`、`ci-cd-and-automation`、`observability-and-instrumentation`、
`shipping-and-launch`、`deprecation-and-migration`、`constraint-driven-development`

**复议补录 1 个**：`api-and-interface-design`

它原本被判为「部分邻接，可复议」（邻接承接方的领域建模 / 接口边界）。复议通过的理由：
本包定位是**通用工程补强**，而**接口契约是原 9 个完全空白的一域**——
14 个技能里没有任何一个做 REST / GraphQL 端点设计、模块边界或模块间类型契约。
成本为零（同一上游仓，改一行清单），且实测**不产生任何新增悬空引用**
（它只引用 `deprecation-and-migration`，已在包内）、不需要新增共享清单。

### B 组 · 引用闭包 5 个（addyosmani/agent-skills，**不按**上述准则）

`debugging-and-error-recovery`、`code-review-and-quality`、`test-driven-development`、
`interview-me`、`incremental-implementation`

收录依据只有一个：**A 组正文直接引用它们**。不收进来，代理顺着 A 组的指示会去找不存在的技能。
原 9 个（补录 `api-and-interface-design` 之前）的正文共 11 处引用指向这 5 个
（`debugging-and-error-recovery` 3 处、`code-review-and-quality` 3 处、`test-driven-development` 2 处、
`interview-me` 2 处、`incremental-implementation` 1 处）。

代价是明确的：这 5 个与承接方 `mattpocock-skills` 功能重叠，会重新引入触发时机竞争。
`harness-engineering-skills-index` 因此写明**承接方优先、B 组兜底**。

### C 组 · 承接空缺 5 个（obra/superpowers，按「mattpocock 侧有没有」选）

`receiving-code-review`、`verification-before-completion`、`finishing-a-development-branch`、
`using-git-worktrees`、`dispatching-parallel-agents`

**背景**：承接方是 `mattpocock-skills`。按本机**实际安装**的 mattpocock-skills 25 个技能逐个核对，
上面 5 个**全部没有对应项**（不是靠上游 README 推断，是读本地插件目录得出的）：

| C 组技能 | 本机 mattpocock-skills 有同名技能？ | 本机 superpowers 有同名技能？ |
|---|---|---|
| `receiving-code-review` | 否 | 是 |
| `verification-before-completion` | 否 | 是 |
| `finishing-a-development-branch` | 否 | 是 |
| `using-git-worktrees` | 否 | 是 |
| `dispatching-parallel-agents` | 否 | 是 |

**收敛而非救火**：superpowers 插件**当前仍装着**，收这 5 个不是为了让它们不至于消失，
而是让这 5 项能力有一处**确定的归属**——否则同一能力在两个插件里都有，触发时机随上下文漂移。
索引因此写明：**同名并存时以本包为准**，superpowers 那份视为同源副本。

**成本核算（实测）**：这 5 个是天然自洽的一组——

| 核证项 | 结果 |
|---|---|
| 正文是否引用其它技能 | 0 处（无 `superpowers:<skill>` 形式的跨技能引用） |
| 是否引用仓库级 `references/` | 0 处（不需要新增共享清单） |
| 是否有同目录附属文件 | 0 个（每个技能只有一个 `SKILL.md`，无 scripts/无 prompts） |
| 传递引用闭包 | **5 / 5**，不产生任何悬空面 |
| 字节数 | 6,203 + 3,646 + 7,781 + 6,813 + 6,078 = 30,521 B |

**与 B 组的区别**：B 组是「A 组引用了它所以不得不收」，能力上承接方已有；C 组是「承接方真的没有」，
收录本身即是能力落地。

### 隔离与委派：为什么闸门只能写在索引里

`using-git-worktrees` 与 `dispatching-parallel-agents` 这两项**会影响整个 ticket 的执行方式**
（建不建工作区、派几个子代理、谁独占哪些文件），因此不能由代理按技能默认值自作主张。
要求是：**命中时先与用户商定，再进技能正文。**

这个要求**不能写进那两份技能正文**——vendored 零改写是「一键覆盖更新」的前提。
所以它落在自写的索引 `harness-engineering-skills-index` 第 2 节「🔴 CHECKPOINT · 执行方式闸门」，
并被索引第 1 节路由表的两个 🔴 标记、附录 C 的自述，以及 README 的 C 组提示多处互相指向。

上游侧的现状（决定了闸门要写多细）：

- `using-git-worktrees` **自带**一次同意询问（Step 0 问「要不要隔离工作区」），
  但它不涉及 ticket 级别的并行决策；索引补的是**路由层**的闸门，不是重复上游那一次。
- `dispatching-parallel-agents` **完全没有**征求同意的环节——它直接教「在同一响应里发三个派发」。
  这是闸门真正要补的洞：未获用户确认前，最多派只读调查（`explore`），不派写入类子代理（`worker`）。

## 4. 引用闭包只收一跳

A / B 组（addyosmani 这条线）的**传递**引用闭包经实测为 **22 / 25**：

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
  → `to-spec`；`incremental-implementation:41` 原子提交指引 → **本包 C 组** `finishing-a-development-branch` / `using-git-worktrees`
- **交接落点 2 处**：`idea-refine`、`spec-driven-development` → `grilling` / `to-spec`
- **仅对照说明 3 处**：`planning-and-task-breakdown`、`doubt-driven-development`、`source-driven-development`
  → `to-tickets` / `code-review` / `research`，缺了只损失解释力

因此**addyosmani 这条线的引用闭包不完整**，这是有意识的取舍，不是遗漏。

**C 组没有这一层**：闭包 5/5，零悬空。但要注意闭包是**单向**的——
未收录的 superpowers 技能（如 `systematic-debugging:177,189`）确实引用
`superpowers:verification-before-completion` 等本包已收录的技能，那属于未收录技能的下游，不构成悬空。

## 5. 未收录的上游技能

### addyosmani/agent-skills（10 / 25）

- **完全重叠**（承接方已覆盖）：`idea-refine`、`spec-driven-development`、`planning-and-task-breakdown`、
  `incremental-implementation`※、`test-driven-development`※、`debugging-and-error-recovery`※、
  `code-review-and-quality`※、`source-driven-development`、`git-workflow-and-versioning`、
  `documentation-and-adrs`（※ = 已作为 B 组收录，功能上仍以承接方为主）
- **部分邻接，可复议**：`code-simplification`、`doubt-driven-development`
- **抢 harness-creator 领地**：`context-engineering`（争 instructions 子系统 + 同名不同域）、
  `using-agent-skills`（第二套路由）

### obra/superpowers（10 / 15）

| 未收录 | 已被谁覆盖 |
|---|---|
| `brainstorming` | mattpocock `grilling` / `grill-me` / `grill-with-docs` |
| `writing-plans` | mattpocock `to-spec` |
| `executing-plans` | mattpocock `implement` |
| `subagent-driven-development` | mattpocock `implement`（其 in-progress 的 implement-spec 明写按工单图并发实现） |
| `test-driven-development` | mattpocock `tdd`；本包已有 B 组的 addyosmani 同名技能 |
| `requesting-code-review` | mattpocock `code-review`（**发起**审查；C 组只承接收到意见后的处置） |
| `systematic-debugging` | mattpocock `diagnosing-bugs` |
| `writing-skills` | mattpocock `writing-for-agents`（且属域外，非 `/implement` 工程阶段） |
| `using-superpowers` | 机制不同（SessionStart 钩子注入引导词）；剔除后无须对应 |
| `diagnosing-superpowers` | 该插件自带的安装/诊断工具，非工程能力 |

### 刻意留在项目层（生态有货但绑栈，按 1b 节边界不入本包）

`llm-application-dev` 七件套（技术层通用、但与 LangChain 生态绑定更划算）、`supabase-postgres-best-practices`（Postgres 专属）、
各类语言绑定的开发插件。

**未纳入本包的上游资产**：addyosmani 的 9 个 slash command（`commands/*.toml`）与 4 个 subagent（`agents/*.md`）。
它们不在 `skills/` 目录下，MiniMax 本地插件格式也不支持这两种能力；需要时从上游取用。

## 6. 修掉的上游可移植性缺口

addyosmani 上游按单 skill 安装只复制 `skills/<name>/`，**不带仓库级 `references/`**，于是技能正文里的
相对引用会指空。本包把被引用的 6 份共享清单放进包根 `references/`——因为插件布局是
`skills/<name>/SKILL.md`，从技能目录向上两级恰好是包根，**该相对路径天然成立，正文一个字都不用改**。
这既是"可用"的修复，也是"可一键覆盖更新"的前提。

被补齐的 6 份：`security-checklist.md`、`performance-checklist.md`、`accessibility-checklist.md`、
`observability-checklist.md`、`definition-of-done.md`、`testing-patterns.md`
（上游另有 `orchestration-patterns.md`，只被未收录的技能引用，本包不带。）

superpowers 这条线**没有这个缺口**：它的技能不引用仓库级 `references/`，解归档只需 `skills` + `LICENSE` 两块。

## 7. 两个必须记下来的核证结论

**① 本机 superpowers 插件缓存是上游的旧快照，不是改写版。**
本机插件缓存（`~/.minimax/v2/plugin-cache/…`，manifest 版本 6.2.5）里的
`finishing-a-development-branch` 为 7,022 B，而上游 `main` HEAD 同名文件为 7,781 B——
逐行 diff 显示上游**多了**一节「If removal is refused」（工作树删除被拒时先给用户看未提交文件清单，
禁止自行 `--force`）和一条对应的反借口条目。**方向是上游更新，不是本地被改。**
因此本包一律从上游按 commit 拉取，**不沿用本机插件缓存**；
收编后该文件为 7,781 B，与上游 HEAD 逐字节一致。
其余 4 个技能与上游 HEAD 本就逐字节一致，许可文件也一致。

**② 与先前那份整仓副本的差异。**
原 `plugins/agent-skills` 是 addyosmani 上游整仓 v0.6.10 的本地副本，**落后于上游 HEAD**：它缺
`skills/security-and-hardening/references/hardening-patterns.md`，且 `references/security-checklist.md`
为 14,034 B（上游 14,360 B）。本包的内容全部从上游 HEAD 重新拉取，不沿用那份副本。

## 8. 维护规则

- 不要在本地改写 `skills/` 下这 20 个目录、`references/`、`licenses/`。`--apply` 会检测漂移并默认拒绝覆盖。
- 要加本地增补，另建目录并登记进 `upstream.lock.json` 的 `unmanaged`。
- **新增收录技能时，先用引用扫描确认它的二跳引用**：只加一跳是本包的既定取舍，
  二跳引用应进索引的映射表，而不是继续 vendored。
- **加新上游**时在 `scripts/update-upstream.mjs` 的 `SOURCES` 里加一条配方
  （仓库地址 + `skills` 清单 + 可选 `sharedRefs` + 许可落点），锁会自动长出 `sources.<id>` 条目；
  锁格式为 2（per-source），旧的单源锁跑一次 `--apply` 即重建。
- 只同步单个上游用 `--only <id>`；`--ref` 对所有选中的上游生效。
- 同步后请复核 `PROVENANCE.md` 第 1 节的 commit 与 `upstream.lock.json` 的 `sources.<id>.commit` 是否一致。
