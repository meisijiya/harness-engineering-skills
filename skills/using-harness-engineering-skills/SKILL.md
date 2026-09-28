---
name: using-harness-engineering-skills
description: Use before acting on code — establishes how to find and invoke this package's 20 skills, and requires consulting the routing table first when implementing a ticket (notably with /implement loaded) or when the work needs an engineering capability this package covers. 动手改代码前先过路由表：命中哪一行就点名最贴近当前动作的那一个，「1% 可能相关」就得调；表里没有的行直接说不归本包，别拿近似技能顶替；工作树隔离与并行委派前必须先与用户商定执行方式。Route only; the procedure always lives in the target skill.
---

<SUBAGENT-STOP>
若你被派去执行某个**具体任务**（有明确的文件范围或验收条件），忽略本入口。
你的指令已经把点名定好了，再过一遍路由表只会让你改道。
</SUBAGENT-STOP>

<EXTREMELY-IMPORTANT>
**动手改代码之前，先过一遍第 1 节的路由表。** 两种场景都算：`/implement` 已加载、正在执行工单；
或不在工单里、但手上的活需要本包覆盖的工程能力。

命中哪一行，就点名**最贴近当前动作**的那一个——「1% 可能相关」就得调，
包括在回答澄清提问之前。表里没有的行，**直接说不归本包**，不要拿包里的近似技能顶上。

这不是建议。「先看一眼代码」「就这点小事」正是自欺的全部形态，见第 0 节末尾的红旗表。
</EXTREMELY-IMPORTANT>

# Harness 工程技能集 · 入口

> 开头的强制姿态管「**要不要调**」；第 1 节管「**调哪个**」；第 3 节管「**用错会怎样**」。三件事分开，别混。

## 怎么用这份入口（30 秒）

1. 翻到**第 1 节**「我正在做什么」，找到对得上的那一行，只点名那一行的技能；
2. 命中 **🔴 闸门** → **停下来把选项摆给用户**，拿到答复再往下走；
3. 点完名就读那个技能的 `SKILL.md`。本文件只负责指路，不代替它执行。

表里没有对得上的行，**说清楚不归本包就算答完**，不要往后翻硬凑一行。

---

## 0. 作用域与边界

**什么时候用本入口**：动手改代码之前。两个典型场景——`/implement` 已加载、正在执行工单；
或不在工单里、但手上的活需要本包覆盖的工程能力。本入口只管**这一步该调哪个技能**。

**本包只覆盖通用工程能力**：接口契约、质量基线、可信输入、性能、界面、浏览器取证、CI、遥测、
发布、迁移、完成前验证、分支收尾、隔离与并行委派。
**拆单、需求对齐、实现主流程、发起独立审查不在这里。**

**表里没有匹配行怎么办**：说清楚不归本包，别拿包里的近似技能顶替——
用错技能比不调更贵。（各组被谁引用、何时才真的需要用，见附录 A。）

### 🔴 闸门高于开头的强令

强令管的是「**要不要调**」，不是「可以不等同意就调」。命中 `using-git-worktrees` 或
`dispatching-parallel-agents` 两行时，**第 2 节的闸门优先**：先问用户、拿到答复，再进技能正文。

### 🛑 红旗：这些念头一冒出来，就是你在找理由不调

> 本表管「**不想调**」，第 3 节管「**调错**」。红旗表处理你不想动手的那一刻，黑名单处理动手之后走偏的那一刻。

| 念头 | 实情 |
|---|---|
| 「我先看一眼代码」 | 技能会告诉你**怎么看**。先过路由表。 |
| 「我得先问清楚才能决定」 | 点名发生在澄清提问**之前**。 |
| 「就这点小事，用不着技能」 | 小事常常正好在 `verification-before-completion` 的射程里。 |
| 「这个技能我知道，直接做一样」 | 知道 ≠ 调用。技能正文随上游更新，你的记忆是旧版。 |
| 「调技能绕远」 | 绕远的是硬编。没调技能的做法，出错时回溯不到依据。 |
| 「这技能小题大做」 | 简单的事变复杂，正是它拦下来的。 |

> 开头的强制姿态与本节的红旗表，结构对齐 `obra/superpowers` 的 `using-superpowers`（MIT）。
> 那个技能**没有**被 vendored（它是无条件强令，与本包「工单阶段内强令、阶段外让位」的定位冲突），
> 所以这里只借鉴结构、逐条改写成上面的作用域版本——**不随 `--apply` 自动更新**，上游改了要人工比对。

---

## 1. 我正在做什么 → 点名哪个

> 典型用法是「用 implement skill 执行某工单，同时把这个插件也用上」。implement 负责推进节奏，
> 本包在它的流程缝隙里补工程能力。**只点名与当前这一件事真实相关的，不要把表念一遍。**

| 我正在做什么 | 点名 | 症状词与要点 |
|---|---|---|
| 开工前，决定**在哪儿干** | 🔴 `using-git-worktrees` | **先问用户**（第 2 节）。本机无原生 worktree 工具，落点见第 5 节 |
| 同时推多个互不依赖的活 | 🔴 `dispatching-parallel-agents` | **先问用户**（第 2 节）。没确认前只派只读调查；角色见第 5 节 |
| 把工单切小、定实现顺序 | — 不归本包 | 拆单不属本包，别拿 `incremental-implementation` 顶替 |
| 定接口契约、划模块边界 | `api-and-interface-design` | 症状：REST / GraphQL 端点、前后端接口约定、模块间类型契约。契约先于实现，订单/支付这类金额敏感的先定 |
| 定质量基线，防中途静默降标 | `constraint-driven-development` | 症状：代理塞 `@ts-ignore`、删测试、降阈值来「变绿」。产出 `CONSTRAINTS.md`，并往指令文件追加一行（附录 C） |
| 处理不可信输入、认证、个人数据 | `security-and-hardening` | 症状：依赖审计、个人数据合规、key/token/上传文件名这类客户端可伪造的东西 |
| 有**可测量**的性能问题 | `performance-optimization` | 症状：怀疑性能回归、Core Web Vitals、加载时间变长、N+1 查询。没有测量数据别叫它，那属于提前优化 |
| 写界面、组件、状态 | `frontend-ui-engineering` | 含 WCAG 2.1 AA 无障碍 |
| 需要真实浏览器证据 | `browser-testing-with-devtools` | 症状：DOM、控制台报错、网络请求、性能 trace、视觉核对。**需 chrome-devtools MCP**，没配就不可用（第 4 节） |
| 把质量门禁自动化、接 CI | `ci-cd-and-automation` | 症状：GitHub Actions、测试运行器、部署策略。检查应当**接进** `init.sh` / CI，不要另立一套命令 |
| 加日志 / 指标 / 追踪 / 告警 | `observability-and-instrumentation` | 特性要带遥测一起上线，告警带 runbook |
| 准备发布、回滚策略 | `shipping-and-launch` | 症状：要预发布清单、特性开关 / 分阶段 / 错误预算闸门 / 回滚。要可逆、可观察、增量 |
| 删旧系统、改库表列、清僵尸代码 | `deprecation-and-migration` | 线上不停机改列走 expand/contract，旧接口走绞杀者模式 |
| 测试还红着、根因不明 | `debugging-and-error-recovery` | 排查口径：先定位一个根因，别一次派多个代理 |
| 要**发起**一次独立审查 | — 不归本包 | 发起审查不属本包；本包只管「收到意见之后怎么处置」 |
| **收到**评审意见、准备动手改之前 | `receiving-code-review` | 上面管「发起」，这条管「收到之后怎么核实与处置」 |
| 要说出「做完了 / 通过了 / 能合了」 | `verification-before-completion` | 没有本次跑出来的命令 + 完整输出 + 退出码，就不能说 |
| 实现完成，要决定怎么并回去 | `finishing-a-development-branch` | 合并 / 提 PR / 保留三选一，收尾走它 |
| 调查陌生代码、只读取证 | — 不归本包 | 用宿主的只读调查子代理，不占本包技能 |
| 压测、分布式韧性、具体框架调优 | — **有意不做** | 栈相关能力随项目安装，见第 3 节第 6 条 |

---

## 2. 🔴 CHECKPOINT · 执行方式闸门：隔离与委派，先和用户商定

> **这两项不自动触发。** 命中时先把选项摆给用户、拿到答复再进技能正文。
> 一个 ticket 用什么方式推进是用户的决定，不是这两个技能的默认值。
> 若用户此前已表明偏好，**按偏好走、不重复追问**；否则本入口这道闸门与技能正文自身的询问都要过。

### 🔴 隔离：先问三件事

| 选项 | 什么时候选它 |
|---|---|
| 原地做（当前分支） | 单点小改，或本仓已有明确的分支隔离约定 |
| 新开功能分支，仍在当前工作区 | 只需要分支边界，不打算多线并行 |
| 建独立 worktree | 本批工单要多线并行，或当前工作区有未提交改动、会被这批工单波及 |

再确认：worktree 目录位置（`.worktrees/` 优先于 `worktrees/`）、分支名、基线测试由谁跑。

### 🔴 委派：先问四件事

1. 这批活**是否真的互不依赖**？共享状态、写同一批文件、或需要全局理解的，一律不并行。
2. 切成几条并行线，每条负责哪个问题域。
3. 每条线的**写入范围**（哪些文件归它独占）。范围重叠不是并行，是并行写冲突。
4. 检查点怎么设：子代理返回后由谁复验、满足什么条件才允许合并回主线。

**🛑 硬约束：没拿到用户确认前，最多派只读调查，不派写入类子代理。**
上游 `dispatching-parallel-agents` 只讲「怎么并行派」，**完全没有征求同意的环节**——本节补的就是这一层。

---

## 3. 🛑 反例黑名单：这么用会出错

1. **把 20 个技能当清单倒给用户。** 命中多行时**只点最窄的那一行**——判据是「哪一行最贴近当前这个动作」，
   其余一句带过（「其余不归本包 / 暂不适用」），不要逐行解释。
   **这条就是第 0 节「1% 就点」的操作化**：「1%」管**别漏**，本条管**别全点**——
   漏了是掉能力，全点了是掉判断力，两个都算错，但漏更贵。
2. **拿本包的 B 组去干「发起类」的活。** 本包只覆盖工程环节：契约、质量基线、安全、性能、界面、
   浏览器取证、CI、遥测、发布、迁移、完成前验证、分支收尾。**拆单、需求对齐、实现主流程、
   发起独立审查不在这里**——遇到这类活直接说不归本包，别拿 B 组顶上（各组被谁引用、
   何时才真的需要用，见附录 A）。
3. **闸门没过就派写入类子代理，或直接建 worktree。**
4. **把 `CONSTRAINTS.md` 当验证入口。** 它只回答「标准是什么」，跑什么仍然是 `init.sh` / CI。
5. **没跑验证就宣布完成**，或者采信子代理的「已修好」而不自己看 diff。
6. **拿近似技能顶替包里没有的能力**（压测、分布式、框架调优）。这些有意不入本包——
   直接说做不了，别硬凑一个。
7. **表演性赞同评审意见**，或盲目照改。核实 → 有依据地反驳 / 记为显式延后，都比照办好。
8. **本地改写 `skills/` 下的技能正文。** 20 个目录都是上游逐字节副本，改了就失去一键覆盖更新，
   同步脚本会检测到漂移并拒绝覆盖。

---

## 4. 出问题怎么办（if-then 兜底）

> 三列两段：**一线修复**是第一反应，**仍失败兜底**是一线做完还不行时干什么。
> 只写一列「怎么办」会在第一步失败处卡住——那正是当初写这张表要避免的事。

| 触发条件（症状） | 一线修复 | 仍失败时的兜底 |
|---|---|---|
| 第 1 节表里**一行都没匹配上** | 说明这个环节不属本包（压测 / 分布式 / 框架调优等有意不做），**别硬凑一行** | **明说本包不覆盖**，别拿近似技能顶上；用户手上有别的工具就问他用不用 |
| 同时像**好几行**，拿不准点哪个 | 点**最窄**的那一行——最贴近当前这个动作的那行（见第 3 节第 1 条） | 把候选行摆给用户挑，比自己猜一个强 |
| `browser-testing-with-devtools` 没有 chrome-devtools MCP | 该技能不可用。说明原因，退回由用户自己开浏览器取证 | 跳过这个维度并**讲清代价**，不要假装验过了 |
| 用户在闸门里选了不建 worktree | 尊重选择，在当前工作区做。**不要反复劝** | 只在发现实际冲突时提一次；用户仍坚持就按用户的做，记下风险 |
| 子代理返回后发现根因互相重合 | 立即停掉剩余并发，改单点修复——那本来就不是三个独立问题 | 回到第 3 节第 1 条重新点名，别在错误分片上继续派 |
| 隔离的代码范围与子代理正在读的范围重叠 | 要么把本 ticket 隔离出去，要么先做完只读调查再改 | 两边都动不了就**串行做**，不要一边写一边读 |
| 多个测试文件同时挂 | 先当**一个根因信号**（共同依赖 / 配置漂移 / 时序竞态）查一次完整堆栈 | 确实多根因再拆，此时才谈并行；别一上来就派多个代理 |
| 顺着某个技能的指示去找一个**不存在的技能** | 那是 B 组的二跳悬空引用，按**附录 B** 的映射表判断它缺的是哪一类能力 | 附录 B 也没写就说这个引用悬空，**不要硬找** |
| 包里某技能与别处同名 | 以本包为准；C 组 5 项是刻意收敛过来的，superpowers 那边视为同源副本 | 不要两边各改一半——本包是逐字节副本，改了就失去覆盖式更新 |
| `--apply` 报本地漂移 | 先确认要丢弃什么，**不要为了「变干净」直接 `--force`** | 逐字节比对确认真有实质差异再决定；多半只是 CRLF 之类的换行符问题 |

---

## 5. 宿主适配映射

上游 C 组的正文按 Claude Code 写成，本机形态不同。**技能正文一字未改**，落点按下表：

| 上游原文 | 本机落点 | 说明 |
|---|---|---|
| `dispatching-parallel-agents` 的 `Subagent (general-purpose): "…"` 派发写法 | 委派调用 + 指定角色 | 内置 `mavis` / `worker` / `explore` / `verifier`。写入类用 `worker`（需独占文件），只读调查用 `explore`；**同一响应里发出多个委派调用即为并行**，逐个发就是串行。**派之前先过第 2 节闸门。** |
| `using-git-worktrees` Step 1a 的原生 worktree 工具（`EnterWorktree` / `/worktree` / `--worktree`） | 本机无此工具 → 直接落到 Step 1b | 按 1b 的 `git worktree add` 走。Step 0 的隔离检测、Step 2 依赖安装、Step 3 基线验证照旧 |
| `finishing-a-development-branch` Step 6 的 "Superpowers created this worktree — we own cleanup" | 判据是路径前缀，不是归属 | 实际判断条件是工作树落在 `.worktrees/` 或 `worktrees/` 之下就归我们清理，否则留给宿主。正文里的 "Superpowers" 只是原作者对自己行为的称呼 |

---

## 附录 A · 三组来源与收录依据

| 组 | 数量 | 来源 | 收录依据 |
|---|---|---|---|
| **A 组 · 精选** | 10 | addyosmani/agent-skills | 与其他工程纪律重叠度低、不侵入 instructions/verification/scope 三子系统、工程阶段真实净增量 |
| **B 组 · 引用闭包** | 5 | addyosmani/agent-skills | **被 A 组正文直接引用**；不收进来，代理顺着 A 组的指示会去找不存在的技能 |
| **C 组 · 收尾与协作** | 5 | obra/superpowers | 补上前两组没有的**收尾类与协作类**能力（评审意见处置、完成前验证、分支收尾、工作树隔离、并行委派）；正文自洽，零悬空引用 |

B 组被谁引用、什么时候才真的需要用：

| 技能 | 被谁引用 | 何时真的需要用它 |
|---|---|---|
| `debugging-and-error-recovery` | `ci-cd-and-automation`、`observability-and-instrumentation`、`security-and-hardening` 共 3 处路由 | 第 1 节「根因不明」那行直接指向它；也常被 A 组三处路由兜底调用 |
| `code-review-and-quality` | `constraint-driven-development`（路由 + See Also） | 需要自己走一次多轴审查时（发起独立审查不属本包，被要求自查时用它） |
| `test-driven-development` | `constraint-driven-development`（See Also） | 这次要动测试、而别处没有 TDD 纪律时 |
| `incremental-implementation` | `deprecation-and-migration`（迁移每步的垂直切片指引） | 做分步迁移；或一个改动太大、不知道从哪一刀切下去时 |
| `interview-me` | `constraint-driven-development`（直接借用其一次一问的提问纪律） | 探测项目现状、需求还很糊时 |

C 组的 5 项（`using-git-worktrees`、`dispatching-parallel-agents`、`receiving-code-review`、
`verification-before-completion`、`finishing-a-development-branch`）正文**不引用任何其它技能、
不引用仓库级 `references/`、无同目录附属文件**，闭包 5/5，零悬空面。

---

## 附录 B · 悬空引用映射（仅在被指向时读）

B 组自身还引用了 6 个**未收录**的上游技能。这些引用不继续 vendored（再收一跳会一路吞到 22/25，
基本等于整仓），按下表解析。性质一栏决定缺了它到底损失什么。

| 悬空引用 | 出现位置 | 性质 | 它缺的是哪一类能力 |
|---|---|---|---|
| `spec-driven-development` | `interview-me:129` | **真流程缺口**：让 agent 向用户 offer 用它起草规格 | 非本包：**规格起草** |
| `git-workflow-and-versioning` | `incremental-implementation:41` | **真流程缺口**：按它的原子提交指引提交 | 本包 C 组 `finishing-a-development-branch` / `using-git-worktrees` 可覆盖；合并冲突需外部工具 |
| `idea-refine` | `interview-me:14,190,235` | 交接落点：意图澄清后的下游交接 | 非本包：**需求对齐** |
| `spec-driven-development` | `interview-me:14,191,235` | 交接落点同上 | 非本包：**规格起草** |
| `planning-and-task-breakdown` | `interview-me:192` | 仅时间线说明：两跳下游 | 非本包：**拆单** |
| `doubt-driven-development` | `interview-me:14,193` | 仅对照说明：决策**后**的产物复核 | 非本包：**审查/批判** |
| `source-driven-development` | `interview-me:194` | 仅对照说明：验证框架事实 | 非本包：**外部事实核查** |

**读法**：只有「真流程缺口」那两行会导致动作落空，必须照右列执行——右列写了「本包 C 组可覆盖」的照做，
写了「非本包」的**明说这一步本包不覆盖**，不要用包里的近似技能顶替。
「仅对照说明」缺失只损失解释力；「交接落点」属于需求对齐阶段，同样不在本包。C 组没有这一层。

---

## 附录 C · 与 harness-creator 的交界、共享清单、更新

**交界只有三处：**

1. **`constraint-driven-development` 会往指令文件追加一行**
   `Read CONSTRAINTS.md before writing code. Do not weaken it to make a change pass.`
   这一行落在指令子系统里，会占用 `AGENTS.md` 的字节/行数/工作规则预算——追加后要回查预算是否仍合规。
2. **验证入口始终是 `init.sh`，不是 `CONSTRAINTS.md`。**
   `verification-before-completion` 同理：它要求「证据先行」，但**跑哪条命令**仍由项目自己的 `init.sh` / CI 决定。
3. **本入口不新增分流键。** 本包只覆盖工程阶段能力，不接管实现主流程。

**共享清单**：技能正文用 `../../references/x.md` 引用包根的仓库级共享清单，上游按单 skill 安装**不会**带上，
所以本插件把它们放在 `references/`。路径与包结构一致，因此**技能正文一个字都没改**——
这正是能一键覆盖式跟上游更新的原因。这些清单是给技能正文用的，日常不需要人手动去读；
**但改动 `references/` 之前要按下面这张表核对引用方**，漏列会让人裁掉仍在用的清单。

| 文件 | 被谁引用 |
|---|---|
| `references/security-checklist.md` | `security-and-hardening`、`shipping-and-launch`、`code-review-and-quality` |
| `references/performance-checklist.md` | `performance-optimization`、`shipping-and-launch`、`code-review-and-quality` |
| `references/accessibility-checklist.md` | `frontend-ui-engineering`、`shipping-and-launch` |
| `references/observability-checklist.md` | `observability-and-instrumentation` |
| `references/definition-of-done.md` | `shipping-and-launch`、`incremental-implementation` |
| `references/testing-patterns.md` | `test-driven-development` |

上表由 `scripts/check-ref-table.mjs` 逐行对账各技能正文的实际引用生成。**改这张表或动 `references/` 之后，
先跑 `node scripts/check-ref-table.mjs`**，不一致就别提交。

**更新到上游最新版：**

```bash
node scripts/update-upstream.mjs --check    # 只看两个上游的差异，不写文件
node scripts/update-upstream.mjs --apply    # 同步两个上游并镜像到安装目录
node scripts/update-upstream.mjs --apply --only superpowers   # 只同步一个上游
```

`skills/` 下这 20 个目录、`references/`、`licenses/` 下两份许可全文，都是两个上游的**逐字节副本**。
各上游的锁定 commit 与逐文件 sha256 见 `upstream.lock.json` 的 `sources.<id>`。

**本入口不做什么**：不代任何技能下结论；不引入第二套流程入口；不重复上游正文；
**约束性内容只有两处**——开头的**强制姿态**与第 2 节的**执行方式闸门**，
其余全是对照与映射。
