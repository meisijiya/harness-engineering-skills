---
name: harness-engineering-skills-index
description: Routing map for the 20 engineering skills in this plugin — pure reinforcement for mattpocock-skills under harness-creator, not a second workflow layer. 路由表：告诉我「我正在做的事」该点名哪个技能、以及哪些必须先问用户。Use when deciding which skill to load, when an upstream skill name is referenced but not bundled, or before worktree isolation and parallel delegation — those two require settling the execution mode with the user first. 工作树隔离与并行委派前先问用户，不要自己决定。Route only; the procedure always lives in the target skill.
---

# Harness 工程技能集 · 索引

## 怎么用这份索引（30 秒）

1. 翻到**第 1 节**「我正在做什么」，找到对得上的那一行，只点名那一行的技能；
2. 命中 **🔴 闸门** → **停下来把选项摆给用户**，拿到答复再往下走；
3. 点完名就读那个技能的 `SKILL.md`。本文件只负责指路，不代替它执行。

本包 20 个技能与承接方 `mattpocock-skills` 的 25 个**零同名重叠**——补的是它没有的通用工程能力，
不接管它的流程主导权。需求对齐、规格、拆单、**实现主流程**、测试、发起评审，仍然是 mattpocock 的事。

---

## 1. 我正在做什么 → 点名哪个

> 典型用法是「用 implement skill 执行某工单，同时把这个插件也用上」。implement 负责推进节奏，
> 本包在它的流程缝隙里补工程能力。**只点名与当前这一件事真实相关的，不要把表念一遍。**

| 我正在做什么 | 点名 | 症状词与要点 |
|---|---|---|
| 开工前，决定**在哪儿干** | 🔴 `using-git-worktrees` | **先问用户**（第 2 节）。本机无原生 worktree 工具，落点见第 5 节 |
| 同时推多个互不依赖的活 | 🔴 `dispatching-parallel-agents` | **先问用户**（第 2 节）。没确认前只派只读调查；角色见第 5 节 |
| 把工单切小、定实现顺序 | — 不归本包 | mattpocock `to-tickets` / `implement` |
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
| 测试还红着、根因不明 | `debugging-and-error-recovery` | 排查口径；mattpocock `diagnosing-bugs` 是主力，B 组兜底 |
| 要**发起**一次独立审查 | — 不归本包 | mattpocock `code-review` |
| **收到**评审意见、准备动手改之前 | `receiving-code-review` | 上面管「发起」，这条管「收到之后怎么核实与处置」 |
| 要说出「做完了 / 通过了 / 能合了」 | `verification-before-completion` | 没有本次跑出来的命令 + 完整输出 + 退出码，就不能说 |
| 实现完成，要决定怎么并回去 | `finishing-a-development-branch` | 合并 / 提 PR / 保留三选一，收尾走它 |
| 调查陌生代码、只读取证 | — 不归本包 | 用宿主的只读调查子代理，不占本包技能 |
| 压测、分布式韧性、具体框架调优 | — **有意不做** | 栈相关能力随项目安装，见第 3 节第 6 条 |

---

## 2. 🔴 CHECKPOINT · 执行方式闸门：隔离与委派，先和用户商定

> **这两项不自动触发。** 命中时先把选项摆给用户、拿到答复再进技能正文。
> 一个 ticket 用什么方式推进是用户的决定，不是这两个技能的默认值。
> 若用户此前已表明偏好，**按偏好走、不重复追问**；否则索引这道闸门与技能正文自身的询问都要过。

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

1. **把 20 个技能当清单倒给用户。** 只点名与当前这一件事真实相关的；用不上的要**主动说明为什么不适用**。
2. **用 B 组技能抢承接方的活。** 成对映射：`test-driven-development` ← mattpocock `tdd`；
   `incremental-implementation` ← `implement`；`code-review-and-quality` ← `code-review`；
   `debugging-and-error-recovery` ← `diagnosing-bugs`；`interview-me` ← `grilling`。
   **承接方在场时 B 组只兜底**（各组被谁引用、何时才真的需要用，见附录 A）。
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

| 症状 | 怎么办 |
|---|---|
| mattpocock 技能加载不到 / 没装 | 走对应 B 组兜底，成对映射见**第 3 节第 2 条**；B 组也没有就**明说缺什么**，不要用近义技能顶替 |
| `browser-testing-with-devtools` 没有 chrome-devtools MCP | 该技能不可用。说明原因，退回由用户自己开浏览器取证，或跳过这个维度并讲清代价 |
| 用户在闸门里选了不建 worktree | 尊重选择，在当前工作区做。**不要反复劝**，只在发现实际冲突时提一次 |
| 子代理返回后发现根因互相重合 | 立即停掉剩余并发，改单点修复——那本来就不是三个独立问题 |
| 隔离的代码范围与子代理正在读的范围重叠 | 一边写一边读会让诊断结论过期。要么把本 ticket 隔离出去，要么先做完只读调查再改 |
| 多个测试文件同时挂 | 先当**一个根因信号**（共同依赖 / 配置漂移 / 时序竞态）查一次完整堆栈，可能比派多个代理更快 |
| 顺着某个技能的指示去找一个**不存在的技能** | 那是 B 组的二跳悬空引用，按**附录 B** 的映射表落到实际承接方，不要硬找 |
| 包里某技能与别处同名 | 以本包为准；C 组 5 项是刻意收敛过来的，superpowers 那边视为同源副本 |
| `--apply` 报本地漂移 | 先确认要丢弃什么，**不要为了「变干净」直接 `--force`**。漂移多半是 CRLF 之类的换行符问题 |

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
| **A 组 · 精选** | 10 | addyosmani/agent-skills | 与承接方不重复、不侵入 instructions/verification/scope 三子系统、工程阶段真实净增量 |
| **B 组 · 引用闭包** | 5 | addyosmani/agent-skills | **被 A 组正文直接引用**；不收进来，代理顺着 A 组的指示会去找不存在的技能 |
| **C 组 · 承接空缺** | 5 | obra/superpowers | 这 5 项在 mattpocock 侧**没有具名对应**（本机已装 25 个技能，逐个核对确认）；正文自洽，零悬空引用 |

B 组被谁引用、什么时候才真的需要用：

| 技能 | 被谁引用 | 何时真的需要用它 |
|---|---|---|
| `debugging-and-error-recovery` | `ci-cd-and-automation`、`observability-and-instrumentation`、`security-and-hardening` 共 3 处路由 | 承接方 `diagnosing-bugs` 不在场时 |
| `code-review-and-quality` | `constraint-driven-development`（路由 + See Also） | 承接方 `code-review` 不在场时 |
| `test-driven-development` | `constraint-driven-development`（See Also） | 承接方 `tdd` 不在场时 |
| `incremental-implementation` | `deprecation-and-migration`（迁移每步的垂直切片指引） | 做分步迁移，或 `implement` 不可用时 |
| `interview-me` | `constraint-driven-development`（直接借用其一次一问的提问纪律） | 探测项目现状时 |

C 组的 5 项（`using-git-worktrees`、`dispatching-parallel-agents`、`receiving-code-review`、
`verification-before-completion`、`finishing-a-development-branch`）正文**不引用任何其它技能、
不引用仓库级 `references/`、无同目录附属文件**，闭包 5/5，零悬空面。

---

## 附录 B · 悬空引用映射（仅在被指向时读）

B 组自身还引用了 6 个**未收录**的上游技能。这些引用不继续 vendored（再收一跳会一路吞到 22/25，
基本等于整仓），按下表解析。性质一栏决定缺了它到底损失什么。

| 悬空引用 | 出现位置 | 性质 | 解析到 |
|---|---|---|---|
| `spec-driven-development` | `interview-me:129` | **真流程缺口**：让 agent 向用户 offer 用它起草规格 | mattpocock `to-spec` |
| `git-workflow-and-versioning` | `incremental-implementation:41` | **真流程缺口**：按它的原子提交指引提交 | 本包 C 组 `finishing-a-development-branch` / `using-git-worktrees`；合并冲突用 `resolving-merge-conflicts` |
| `idea-refine` | `interview-me:14,190,235` | 交接落点：意图澄清后的下游交接 | 需求对齐阶段 → `grilling` / `grill-me` |
| `spec-driven-development` | `interview-me:14,191,235` | 交接落点同上 | `to-spec` |
| `planning-and-task-breakdown` | `interview-me:192` | 仅时间线说明：两跳下游 | `to-tickets` |
| `doubt-driven-development` | `interview-me:14,193` | 仅对照说明：决策**后**的产物复核 | 审查/批判阶段 → `code-review` / `grill-with-docs` |
| `source-driven-development` | `interview-me:194` | 仅对照说明：验证框架事实 | `research` |

**读法**：只有「真流程缺口」那两行会导致动作落空，必须照右列执行；「仅对照说明」缺失只损失解释力；
「交接落点」按承接方规则走即可。C 组没有这一层。

---

## 附录 C · 与 harness-creator 的交界、共享清单、更新

**交界只有三处：**

1. **`constraint-driven-development` 会往指令文件追加一行**
   `Read CONSTRAINTS.md before writing code. Do not weaken it to make a change pass.`
   这一行落在指令子系统里，会占用 `AGENTS.md` 的字节/行数/工作规则预算——追加后要回查预算是否仍合规。
2. **验证入口始终是 `init.sh`，不是 `CONSTRAINTS.md`。**
   `verification-before-completion` 同理：它要求「证据先行」，但**跑哪条命令**仍由项目自己的 `init.sh` / CI 决定。
3. **本索引不新增分流键。** 实现主流程归 mattpocock，本包只覆盖工程阶段能力。

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

**本索引不做什么**：不代任何技能下结论；不引入第二套流程入口；不重复上游正文；
**唯一的约束性内容是第 2 节的执行方式闸门**，其余全是对照与映射。
