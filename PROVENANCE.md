# PROVENANCE · 来源与选型记录

本插件是一份**精选再分发包**：16 个技能里 **14 个是上游逐字节副本**（addyosmani/agent-skills 9 个 + obra/superpowers 5 个），
另 2 个是本包自写（入口技能 + `old-code`）。

本文件的用途有两个：**① 逐文件说明归属**（哪个文件来自哪个上游、哪些是本包自写）；
**② 说清「为什么是这 16 个」**——每一组为什么留、为什么删，判据是什么。
读到这里还答不出「为什么」，就说明这份记录失职了。

## 1. 上游（两个）

| 项 | 上游 A | 上游 B |
|---|---|---|
| 仓库 | https://github.com/addyosmani/agent-skills | https://github.com/obra/superpowers |
| 锁定 ref | `main` | `main` |
| 锁定 commit | `1be8e34187e34647bb83adc3a1323b26ae6f6abe` | `bb92a77741419a4ab5f06e711a283343f1ada0c3` |
| 许可 | **MIT**，Copyright (c) 2025 Addy Osmani | **MIT**，Copyright (c) 2025 Jesse Vincent |
| 许可全文 | `licenses/agent-skills-LICENSE` | `licenses/superpowers-LICENSE` |
| 收录 | **9 个技能**（A 组） | **5 个技能**（C 组） |
| 逐文件校验 | `upstream.lock.json` → `sources["agent-skills"].managed` | `upstream.lock.json` → `sources.superpowers.managed` |

两个 commit 的权威值是 `upstream.lock.json` 的 `sources.<id>.commit`，本表是它的人类可读副本，两处须一致。

**上游 A 的内容构成**（都以 `managed` 为准，这里只给结构）：
9 份技能正文 + 2 份技能自带的同目录 `references/`（`security-and-hardening/references/hardening-patterns.md`、
`performance-optimization/references/optimization-patterns.md`）+ 5 份仓库级共享清单 `references/*.md`
+ 1 份许可全文。

**上游 B 的内容构成**：5 份技能正文 + 1 份许可全文，没有仓库级 `references/`。

所有 vendored 内容**均为上游字节级副本，零本地改写**。逐文件一个 sha256 + 字节数记录在 `upstream.lock.json`
的 `sources.<id>.managed` 里，`sources.<id>.commit` 锁定各上游的具体版本。两个上游各解归档一次，
不共享临时目录。**本文件不重抄哈希**——那会让两处记录各自漂移；核对归属请读锁文件，不要读这张表。

## 1b. 本包的定位边界

本插件是 **`mattpocock-skills` 在 `harness-creator` 治理下的能力补强**：
补上它没有的**通用工程能力**，不接管它的流程主导权。

机器口径（按本机实际安装的插件目录实测，非上游 README）：

| 比对项 | 结果 |
|---|---|
| 本包 vendored 技能 | **14**（上游 A 9 + 上游 B 5） |
| 本包自写技能 | **2**（入口技能 + `old-code`） |
| 承接方 mattpocock-skills 版本 | **1.3.1** |
| 1.3.1 随插件发布的技能 | **27** = engineering 20 + productivity 7（`misc/`、`in-progress/`、`deprecated/` 三个桶不随插件发布） |
| **两者同名重叠** | **0**（14 个 vendored 技能名逐个比对，取交集为空） |

**同名重叠为零，不等于能力重叠为零。** 这两件事必须分开说：
- **零同名**：没有任何一个技能名同时出现在本包和承接方里，所以「代理看到两个同名技能各抢一次触发」这种最直接的冲突不存在；
- **功能重叠**：存在，而且是**有意保留的**——本包的 `security-and-hardening`、`performance-optimization` 等
  在能力域上与承接方的部分技能相邻。相邻不等于争抢：承接方管**流程编排**（对齐需求、拆单、实现、测试、发起评审），
  本包管**那些流程里用到的通用工程手艺**（输入面、性能面、界面、迁移面、完成前的证据）。判据是
  「命中时机是否会被同一个提示点同时点亮」，不是「文档里讲的词是否重合」。

**核对方式**（可复现）：读本机 mattpocock-skills 1.3.1 插件目录下的技能名列表，与本包 `skills/` 下的目录名取交集，
结果为空集。版本号 1.3.1 是从该插件 manifest 读的；只写「25 个技能」而不写版本的记录无法在半年后被复核。

**本机 omp 环境的一条事实，别据此误判冗余**：本仓对应名 `agent-skills` 的 omp 插件在这台机器上是
`enabled: false`，因此本包 vendored 的 addyosmani 副本**在 omp 里是唯一副本**。A 组 9 个不是「另一个插件的重复品」，
它们就是这些能力在 omp 里的唯一来源。

「补强」不是修辞：需求对齐、规格、拆单、实现、测试、发起评审的主导权仍在承接方，本包不引入第二套流程入口。

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
- **一处非逐字节的衍生**：入口技能的「强制姿态 + 自欺红旗」结构对齐 `obra/superpowers` 的
  `using-superpowers`（同 MIT，本包已随附其许可全文）。那个技能**没有**被 vendored——它是无条件强令
  （「任何时候、技能检查先于一切」），与本包「**按能力触发、只在相关工程动作前**」的定位不合，
  vendored 进来会与承接方正面争夺触发时机。因此只借鉴结构，逐条改写为作用域版本。
  **代价**：它不随 `--apply` 自动更新，上游改了 `using-superpowers` 不会传导到本包，需人工比对。

## 1d. old-code：理念来源与独立实现

`skills/old-code/` 的理念来源是 https://github.com/zjw-swun/old-code ，查阅提交为
`2009cdf83bd00ae125f28bd8313660520e24adea`（2026-09-29）。该提交仅含 README、忽略规则、
原技能与命令文件：README 有 MIT 徽章及 LICENSE 链接，但树中没有许可全文。
本包依据用户的代码掌控与学习目标独立编写流程、参考与评估用例，未复制这些来源文件的正文，
不将来源的许可状态推定为已核验的 MIT，也不把它纳入 `sources` 或同步配方。

本地 `old-code` 将用户独立预测、证据核验和迁移练习嵌入真实代码工作，
分别说明工程结果与理解证据，支持跳过测验；不接管实现流程、不绑定技术栈。
本目录采用本包 MIT 许可，随目录携带 LICENSE；不需要来源仓库才能运行或维护。

## 2. 本包自写（不在上游，同步脚本不接管）

登记在 `upstream.lock.json` 的 `unmanaged`：

| 路径 | 作用 |
|---|---|
| `.minimax-plugin/plugin.json` | 插件清单 |
| `icon.jpg` / `icon-dark.jpg` | 本包专用图标（浅色/深色两版分别生成，非内置资源池）：顶梁 + 三柱 + 基座构成的「门禁闸门」几何标记，避开 `</>` 类代码字形 |
| `LICENSE` | 双源许可说明（见 1c） |
| `upstream.lock.json` | 两个上游的 commit + 逐文件 sha256 锁 |
| `scripts/update-upstream.mjs` | 双上游同步 / 安装镜像脚本 |
| `scripts/check-ref-table.mjs` | 对账索引附录 C 的「共享清单被谁引用」表与各技能正文实际引用是否一致 |
| `scripts/check-package.mjs` | 离线核验技能发现清单、版本、vendored 字节与 old-code 本地维护归属 |
| `skills/old-code/` | 独立编写的代码掌控与学习技能，含参考、使用说明、许可及行为评估用例（见 1d） |
| `skills/using-harness-engineering-skills/SKILL.md` | 入口技能：命名对齐上游 `using-superpowers`，内含能力触发的强制姿态与「闸门高于强令」、**工单实现期 12 行阶段必查表**（1.1，按实现阶段排，是主路径）+ 按能力域的任务维度路由表（1.2，查漏用）、执行方式闸门、反例黑名单、三列两段失败兜底、宿主适配、悬空引用映射（衍生说明见 1c）。**正文不引用承接方插件的技能名** |
| `README.md` / `PROVENANCE.md` | 本文件与使用说明 |

## 3. 收录两组，依据各不相同

### A 组 · 通用工程能力 9 个（addyosmani/agent-skills）

`api-and-interface-design`、`security-and-hardening`、`performance-optimization`、
`frontend-ui-engineering`、`browser-testing-with-devtools`、`ci-cd-and-automation`、
`observability-and-instrumentation`、`shipping-and-launch`、`deprecation-and-migration`

准则来自 `harness-creator` 仓内既有规则：
1. **不重复承接方已有能力**——不是「不重名」，是「不抢同一时机下的同一件事」；
2. **不侵入 instructions / verification / scope 三个子系统**；
3. **必须是工程阶段的真实净增量**。

按能力域看这 9 个为什么留（每域都有承接方完全没有的通用手艺）：

| 能力域 | 技能 | 承接方 1.3.1 覆盖情况 |
|---|---|---|
| 接口与契约 | `api-and-interface-design` | 无。REST / GraphQL 端点设计、模块边界、模块间类型契约 |
| 输入面安全 | `security-and-hardening` | 无通用版（承接方的是审查与流程，不是输入面加固手艺） |
| 性能 | `performance-optimization` | 无。测量—定位—改—复测的完整回路，含 Core Web Vitals 与 N+1 |
| 界面 | `frontend-ui-engineering` | 无通用版，含 WCAG 2.1 AA 无障碍 |
| 界面验证 | `browser-testing-with-devtools` | 无。真实浏览器侧的验证回路 |
| 流水线 | `ci-cd-and-automation` | 无。CI 里的排障回路与失败分类 |
| 可观测性 | `observability-and-instrumentation` | 无。埋点、日志、指标该怎么撒 |
| 发布 | `shipping-and-launch` | 无。上线日监控与回滚触发条件 |
| 旧结构改动 | `deprecation-and-migration` | 无。expand/contract、绞杀者、僵尸代码清理 |

`api-and-interface-design` 原本被判为「部分邻接，可复议」（邻接承接方的领域建模 / 接口边界）。复议通过的理由：
其余 8 个里没有任何一个做接口契约，而接口契约正是最容易在实现期被随手定掉的形状——定错了后面全靠改。
成本为零（同一上游仓，改一行清单），且**不产生任何新增悬空引用**（它只引用 `deprecation-and-migration`，已在包内）、
不需要新增共享清单。

### C 组 · 承接空缺 5 个（obra/superpowers，按「承接方真的没有」选）

`receiving-code-review`、`verification-before-completion`、`finishing-a-development-branch`、
`using-git-worktrees`、`dispatching-parallel-agents`

**背景**：承接方是 `mattpocock-skills` 1.3.1。按本机**实际安装**的插件目录逐个核对
（不是靠上游 README 推断，是读本地目录名），这 5 个**全部没有对应项**：

| C 组技能 | 承接方 1.3.1 有同名技能？ | 功能上承接方的落点 |
|---|---|---|
| `receiving-code-review` | 否 | 承接方有「**发起**审查」，本组管「**收到**意见后怎么核实与处置」——两件事不同 |
| `verification-before-completion` | 否 | 无 |
| `finishing-a-development-branch` | 否 | 无 |
| `using-git-worktrees` | 否 | 无 |
| `dispatching-parallel-agents` | 否 | 承接方的 `implement` 自带并发说明，但不是可独立触发的工作区/派发决策 |

**收敛而非救火**：superpowers 插件**当前仍装着**，收这 5 个不是为了让它们不至于消失，
而是让这 5 项能力有一处**确定的归属**——否则同一能力在两个插件里都有，触发时机随上下文漂移。
索引因此写明：**同名并存时以本包为准**。

**成本核算（实测）**：这 5 个是天然自洽的一组——

| 核证项 | 结果 |
|---|---|
| 正文是否引用其它技能 | 0 处（无 `superpowers:<skill>` 形式的跨技能引用） |
| 是否引用仓库级 `references/` | 0 处（不需要新增共享清单） |
| 是否有同目录附属文件 | 0 个（每个技能只有一个 `SKILL.md`，无 scripts/无 prompts） |
| 传递引用闭包 | **5 / 5**，不产生任何悬空面 |

### 隔离与委派：为什么闸门只能写在索引里

`using-git-worktrees` 与 `dispatching-parallel-agents` 这两项**会影响整个 ticket 的执行方式**
（建不建工作区、派几个子代理、谁独占哪些文件），因此不能由代理按技能默认值自作主张。
要求是：**命中时先与用户商定，再进技能正文。**

这个要求**不能写进那两份技能正文**——vendored 零改写是「一键覆盖更新」的前提。
所以它落在自写的索引 `using-harness-engineering-skills` 第 2 节「🔴 CHECKPOINT · 执行方式闸门」，
并被索引第 1 节路由表的两个 🔴 标记、附录 C 的自述，以及 README 的 C 组提示多处互相指向。

上游侧的现状（决定了闸门要写多细）：

- `using-git-worktrees` **自带**一次同意询问（Step 0 问「要不要隔离工作区」），
  但它不涉及 ticket 级别的并行决策；索引补的是**路由层**的闸门，不是重复上游那一次。
- `dispatching-parallel-agents` **完全没有**征求同意的环节——它直接教「在同一响应里发三个派发」。
  这是闸门真正要补的洞：未获用户确认前，最多派只读调查（`explore`），不派写入类子代理（`worker`）。

## 4. 为什么那 6 个不再收录

**这是本包最容易被后来人推翻的一节，所以先把判据摆出来：**
「引用闭包」是**排版**理由（正文提到了它），不是**能力**理由。凡是只能靠排版理由撑着的收录，
一旦真有人需要那份能力，它就会以错误的形态存在于包里——所以它们被撤销。

### 4.1 引用闭包 5 个（功能上承接方已有）

| 已删技能 | 功能上的承接方（mattpocock-skills 1.3.1） | 垂直切片的差异 |
|---|---|---|
| `test-driven-development` | `tdd` | 承接方是工程流程内的 TDD 步；addyosmani 版是独立的 TDD 方法论长文 |
| `code-review-and-quality` | `code-review` | 承接方管发起与执行审查；本包 C 组 `receiving-code-review` 管收到意见后的处置 |
| `debugging-and-error-recovery` | `diagnosing-bugs` | 承接方是诊断循环；上游那份是排障路由手册 |
| `interview-me` | `grilling` / `grill-me` | 一次一问的提问纪律，承接方有同形态 |
| `incremental-implementation` | `to-tickets` 的垂直切片 | 拆单是承接方的活 |

这 5 个原本的收录依据只有一句「A 组正文直接引用它们，不收进来代理会去找不存在的技能」——那是**排版理由**，
不是能力理由。撤销的理由是：**悬空引用是可登记的**，不必用 vendored 一份技能来解决；
入口技能的附录 B 就是那张登记表，它对每个悬空引用写清出现位置、性质（真流程缺口 / 交接落点 / 仅对照说明）
与替代落点。用一份功能重复的技能去消解 4 处路由说明，是本末倒置。

### 4.2 删除后包内残留的悬空引用：4 处，全部登记在附录 B

| 悬空引用 | 出现位置 | 承接落点 |
|---|---|---|
| `debugging-and-error-recovery` | `ci-cd-and-automation`、`observability-and-instrumentation`、`security-and-hardening` 各 1 处 | 承接方 `diagnosing-bugs` |
| `incremental-implementation` | `deprecation-and-migration` 1 处 | 承接方 `to-tickets`；本包 C 组可覆盖收尾动作 |

4 处全部是「路由/对照说明」性质，缺了只损失解释力，不导致动作落空——所以留悬空、登记映射，
比 vendored 5 份功能重复的技能更划算。

**这一步同时清掉了一个真实的同名冲突**（见第 6 节）：那个 addyosmani 版 `test-driven-development` 是本包
唯一与已启用插件同名且内容不同的技能。

### 4.3 `constraint-driven-development`：它整块落在 harness-creator 的地盘

这个技能产出 `CONSTRAINTS.md`、往指令文件追加一行、生成检查脚本。三件事**逐件**落在
harness-creator 已有的指令与验证子系统里，而那套子系统的判据是明写的：

- `harness-creator` 反例黑名单第 7 条：**能写成测试 / Schema / 门禁的约束一律进 `init.sh`/CI**
  （反模式名是「把文字说明当约束的唯一载体」）——「约束要落成机器载体」这件事已经有主；
- 黑名单第 9 条：**不让技能主动发起工程流程**（写工单、开 ADR、拆分任务）——这个技能正是在替用户发起流程。

也就是说：收下它等于在本包里**保留第二个 harness**。不收。

## 5. 引用闭包：不再是收录依据

引用闭包在本包里**只作为删除决策的输入**（第 4 节就是这么用的）：逐跳统计上游技能的传递引用规模，
可以证明「照着引用继续收会吞掉整仓」，从而说明删除而非补收是正解。

实测：A 组 9 个出发的传递引用闭包覆盖上游 25 个技能里的 22 个——**收满等于搬整仓**，
还会顺带把明确排除的 `context-engineering` 拖进来（见 6.3）。

因此本包维持的取舍是：**vendored 只收「本包自身的能力」，不收「别人正文里提到的名字」**，
跨技能的引用一律由入口技能的附录 B 登记映射。
addyosmani 这条线的引用闭包因此**不完整**，这是有意识的取舍，不是遗漏。

**C 组没有这一层**：闭包 5/5，零悬空。

## 6. 同名与同名不同内容：三条实测结论

### 6.1 C 组 5 个与已启用的 superpowers 6.4.2 逐字节相同

在本机 omp 环境实测，本包 C 组 5 个与已启用的 superpowers 插件副本**逐字节相同**（sha256 全等）：

| C 组技能 | 字节数 |
|---|---|
| `dispatching-parallel-agents` | 6,078 B |
| `finishing-a-development-branch` | 7,781 B |
| `receiving-code-review` | 6,203 B |
| `using-git-worktrees` | 6,813 B |
| `verification-before-completion` | 3,646 B |

**是同源副本，不是能力争抢。** 内容一样的东西不构成「两个技能抢一次触发」——那是同一段文字被读到两次。
本包收 C 组是为了**给这 5 项能力一个确定归属**（第 3 节），不是补内容。

**为什么不改名、不加别名**：承接方自己的 `.out-of-scope/harness-name-collisions.md` 明确拒绝
为「躲某个 harness 的内建命令」而给技能改名或加别名——改名会让人工引用全部失效，且上游下次更新就对不上了。
本包沿用同一立场：C 组技能名维持与上游一致。

### 6.2 真正危险的是同名不同内容，而它已不存在

原 `test-driven-development` 状况相反：addyosmani 版 **16,517 B**，superpowers 同名版 **9,578 B**，
**同名、不同内容、且两边都启用**——这才是会真抢触发的形态（代理命中 `test-driven-development`
时拿到的是哪一份，取决于上下文里插件的启用状态）。

该技能本次随引用闭包一并删除，隐患随之消失。**这构成一条独立的收录判据：
与已启用插件同名且内容不同的技能，不可收录。** 同名但逐字节相同则不在此列。

### 6.3 `context-engineering`：排除理由保留

它**不收**，理由是它与 `harness-creator` 自带的 `references/context-engineering-pattern.md`
**同名不同域**——两份文档讲的是不同的事（上游那份讲压缩会话上下文，本仓那份讲约束系统的上下文预算），
却共用一个名字。并存时读者会以为其中一份是另一份的摘要或更新版，这是典型的误读源。
同名不同域是硬伤，改名又破坏覆盖式更新（vendored 零改写是本包的既定前提），
所以唯一干净的解法是不收。

`using-agent-skills` 同样不收：它是**第二套路由**，而路由是入口技能的职责，一个包只该有一个路由层。

## 7. 未收录的上游技能

### addyosmani/agent-skills

- **能力已由承接方覆盖**：`idea-refine`、`spec-driven-development`、`planning-and-task-breakdown`、
  `source-driven-development`、`git-workflow-and-versioning`、`documentation-and-adrs`
- **能力已由本包以外的方式覆盖**（引用闭包撤销，见第 4 节）：`test-driven-development`、
  `code-review-and-quality`、`debugging-and-error-recovery`、`interview-me`、`incremental-implementation`
- **子系统归属冲突**：`constraint-driven-development`（见 4.3）
- **部分邻接，可复议**：`code-simplification`、`doubt-driven-development`
- **同名不同域 / 第二套路由**：`context-engineering`、`using-agent-skills`（见 6.3）

### obra/superpowers

| 未收录 | 已被谁覆盖 |
|---|---|
| `brainstorming` | 承接方 `grilling` / `grill-me` |
| `writing-plans` | 承接方 `to-spec` |
| `executing-plans` | 承接方 `implement` |
| `subagent-driven-development` | 承接方 `implement` |
| `test-driven-development` | 承接方 `tdd` |
| `requesting-code-review` | 承接方 `code-review`（**发起**审查；本包 C 组只承接收到意见后的处置） |
| `systematic-debugging` | 承接方 `diagnosing-bugs` |
| `writing-skills` | 承接方 `writing-for-agents`（且属域外，非实现期工程阶段） |
| `using-superpowers` | 机制不同（SessionStart 钩子注入引导词）；只借鉴结构不 vendored（见 1c） |
| `diagnosing-superpowers` | 该插件自带的安装/诊断工具，非工程能力 |

### 刻意留在项目层

生态里有货但绑栈，按 1b 节边界不入本包：`llm-application-dev` 系列、`supabase-postgres-best-practices`、
各类语言绑定的开发插件。

**未纳入的上游资产**：addyosmani 的 slash command（`commands/*.toml`）与 subagent（`agents/*.md`）。
它们不在 `skills/` 目录下，本地插件格式也不支持这两种能力；需要时从上游取用。

## 8. 修掉的上游可移植性缺口

addyosmani 上游按单 skill 安装只复制 `skills/<name>/`，**不带仓库级 `references/`**，于是技能正文里的
相对引用会指空。本包把被引用的 **5 份**共享清单放进包根 `references/`——因为插件布局是
`skills/<name>/SKILL.md`，从技能目录向上两级恰好是包根，**该相对路径天然成立，正文一个字都不用改**。
这既是「可用」的修复，也是「可一键覆盖更新」的前提。

被补齐的 5 份：`security-checklist.md`、`performance-checklist.md`、`accessibility-checklist.md`、
`observability-checklist.md`、`definition-of-done.md`。
`references/` 下**只放被包内技能真实引用到的清单**——引用扫描扫不到的那份不 vendored，
否则它就是一份孤儿清单，将来还得有人判断它是漏用还是漏删。
（上游另有 `orchestration-patterns.md`，只被未收录的技能引用，本包不带。）

技能自带的同目录 `references/`（`hardening-patterns.md`、`optimization-patterns.md`）随技能目录一起复制，
不需要额外处理。

superpowers 这条线**没有这个缺口**：它的技能不引用仓库级 `references/`，解归档只需 `skills` + `LICENSE` 两块。

## 9. 必须记下来的两条核证结论

**① 本机 superpowers 插件缓存是上游的旧快照，不是改写版。**
本机插件缓存里的 `finishing-a-development-branch` 为 7,022 B，而上游 `main` HEAD 同名文件为 7,781 B——
逐行 diff 显示上游**多了**一节「If removal is refused」（工作树删除被拒时先给用户看未提交文件清单，
禁止自行 `--force`）和一条对应的反借口条目。**方向是上游更新，不是本地被改。**
因此本包一律从上游按 commit 拉取，**不沿用本机插件缓存**。
其余 4 个技能与上游 HEAD 本就逐字节一致，许可文件也一致。

**② 上游 B 的 commit 前进不传导到正文。**
本包锁定的 superpowers commit 比先前那份记录的 HEAD 更新，但本包 vendored 的 5 个技能正文
**逐字节未变**（见 6.1 的字节数与哈希核验）。也就是说：锁在动，包内容没动——
**这是正常的，不要因为 commit 号变了就以为需要重新比对正文**，反过来也不要把「commit 没变内容」
当成可以跳过漂移检查的理由。

## 10. 维护规则

- 不要在本地改写 `skills/` 下这 14 个 vendored 目录、`references/`、`licenses/`。
  `--apply` 会检测漂移并默认拒绝覆盖。
- 要加本地增补，另建目录并登记进 `upstream.lock.json` 的 `unmanaged`。
- **新增收录技能时，先问三件事**：① 与已启用插件同名吗？同名则必须逐字节相同（第 6 节的判据）；
  ② 它落在承接方已有能力域上吗？是则不收，让悬空引用进附录 B（第 4 节的判据）；
  ③ 它侵入 instructions / verification / scope 子系统吗？是则不收（第 4.3 节的判据）。
  三条都过了，再看它是否与包内已有技能构成真实能力重复。
- **删除收录技能时**，把它的引用方逐个找出来登记进入口技能附录 B——删技能的成本不在删除，
  在于漏掉让哪几处指向了空气。不要用「再收一份功能重复的技能」来消解悬空。
- **加新上游**时在 `scripts/update-upstream.mjs` 的 `SOURCES` 里加一条配方
  （仓库地址 + `skills` 清单 + 可选 `sharedRefs` + 许可落点），锁会自动长出 `sources.<id>` 条目。
- 只同步单个上游用 `--only <id>`；`--ref` 对所有选中的上游生效。
- 同步后请复核本文件第 1 节的 commit 与 `upstream.lock.json` 的 `sources.<id>.commit` 是否一致。
- **动 `references/` 或索引里那张「被谁引用」表之后，跑 `node scripts/check-ref-table.mjs`。**
  那张表写成对照形式之后就从描述变成了断言，读者会照它增删清单——它历史上漏列过 3 处真实引用
  （`code-review-and-quality` 引 `security-` / `performance-checklist.md`、
  `incremental-implementation` 引 `definition-of-done.md`），跨 3 个版本都没人发现，
  直到被 3 个独立 judge 同时指出。**改表靠肉眼看是发现不了的，必须脚本对账。**
- **给技能改名后跑一次 `--install` 并确认没有空目录残留。** 镜像只逐个删文件、不删目录，
  改名或上游删技能都会在安装目录留下同名空壳——文件列表对得上、目录树却不同构。
  （镜像脚本已补：清理文件后按深度倒序 `rmdir` 变空的目录，非空的一律保留。）
- 入口技能名是 `using-harness-engineering-skills`，对齐 `obra/superpowers` 的 `using-superpowers`
  这条上游约定，负责能力触发、委派范围、动作切换后的路由、执行方式闸门与悬空引用登记；
  `old-code` 负责代码掌控与学习。
  两者独立维护，修改后运行 `./init.sh`，行为变化另做针对性评估；联网 `--check` 仅报告上游变化与漂移。
