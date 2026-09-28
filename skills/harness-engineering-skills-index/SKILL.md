---
name: harness-engineering-skills-index
description: Index and routing map for the twenty harness-governed engineering skills bundled in this plugin — ten selected for net-new capability, five pulled in to close their cross-references, and five gap-fillers from superpowers covering review-feedback handling, verification-before-completion, branch finish, worktree isolation and parallel delegation. Use when you need to decide which skill to load, when an upstream skill name is referenced but not bundled, when you need to know how these skills hand work to harness-creator's AGENTS.md and init.sh and to the superpowers / mattpocock counterpart skills, or when you need the host-tool mapping for the superpowers-sourced skills. Use it to route, not to execute — the actual procedure always lives in the target skill.
---

# Harness 工程技能集 · 索引

本插件从**两个上游**打包 **20 个**技能，分三组，加本文件。
本文件**只做索引与路由**，不含任何工作规则；真正要执行的流程始终在被指向的那个技能里。

本包定位是 **`/implement` 阶段的通用补强**：与语言、框架、数据库无关的通用工程能力。
栈相关技能（LangChain4j、Postgres 专属规则、具体框架调优）**不入本包**，随项目按需安装。

| 组 | 数量 | 来源 | 收录依据 |
|---|---|---|---|
| **A 组 · 精选** | 10 | addyosmani/agent-skills | 与承接方不重复、不侵入 instructions/verification/scope 三子系统、工程阶段真实净增量 |
| **B 组 · 引用闭包** | 5 | addyosmani/agent-skills | **被 A 组正文直接引用**；不收进来，代理顺着 A 组的指示会去找不存在的技能 |
| **C 组 · 承接空缺** | 5 | obra/superpowers | 本机 superpowers 下线后，这 5 项在承接方里没有具名落点；正文自洽（零悬空引用） |

---

## 1. A 组路由表：什么时候用哪一个

| 阶段 | 技能 | 什么时候用 | 典型产出 |
|---|---|---|---|
| 全程基线 | `constraint-driven-development` | 质量标准没写下来；代理开始塞 `@ts-ignore`、删测试、降阈值来"变绿" | `CONSTRAINTS.md`（Floor / 有数字强制 / 已测量未强制 / 例外 四段） |
| 定接口 | `api-and-interface-design` | 设计 REST / GraphQL 端点；划模块边界；定义模块间的类型契约；前后端接口约定 | 稳定的接口契约 + 边界约定（错误语义、版本、演进规则） |
| 写代码时 | `security-and-hardening` | 处理不可信输入、认证会话、外部集成、依赖审计、个人数据合规 | 威胁建模 + Always Do / Ask First / Never Do 三层边界 |
| 写代码时 | `performance-optimization` | 有性能指标要求；怀疑性能回归；Core Web Vitals / 加载时间 / N+1 查询 | 测量 → 定位瓶颈 → 修反模式 → 验证并**决定保留或回滚** → 防回归 |
| 写界面时 | `frontend-ui-engineering` | 做组件、布局、状态；WCAG 无障碍；产出需要"像人做的"而不是 AI 味的界面 | 组件结构 + 设计系统遵从 + WCAG 2.1 AA |
| 运行时 | `browser-testing-with-devtools` | 需要真实浏览器证据：DOM、控制台报错、网络请求、性能 trace、视觉核对 | Chrome DevTools MCP 的实测数据（**需先配好该 MCP**） |
| 交付机制 | `ci-cd-and-automation` | 要把质量门禁自动化；搭或改流水线；配测试运行器；定部署策略 | 质量门禁流水线 + GitHub Actions + 分阶段发布与回滚 |
| 上线后 | `observability-and-instrumentation` | 加日志/指标/追踪/告警；**特性要带遥测一起上线**；线上问题查不出发生了什么 | 日志 + 指标 + 追踪 + 告警（含 runbook） |
| 上线动作 | `shipping-and-launch` | 准备发布；要预发布清单；要特性开关 / 分阶段 / 错误预算闸门 / 回滚策略 | 预发布清单 + 发布序列 + 回滚策略 |
| 生命周期 | `deprecation-and-migration` | 删旧系统/旧 API/旧特性；不停机改库表列（expand/contract）；清理僵尸代码 | 弃用决策 + 迁移步骤 + 绞杀者/适配器等迁移模式 |

## 2. B 组：被引用的 5 个

这 5 个**不满足 A 组的三条准则**——它们与 harness-creator 的承接方有功能重叠。收它们只为让 A 组正文里的引用有着落。

| 技能 | 被谁引用 | 何时真的需要用它 |
|---|---|---|
| `debugging-and-error-recovery` | `ci-cd-and-automation`、`observability-and-instrumentation`、`security-and-hardening` 共 3 处路由 | 上面三处都写明"正在发生的故障走它" |
| `code-review-and-quality` | `constraint-driven-development`（路由 + See Also） | 承接方不提供代码评审能力时 |
| `test-driven-development` | `constraint-driven-development`（See Also） | 承接方不提供 TDD 纪律时 |
| `incremental-implementation` | `deprecation-and-migration`（迁移每步的垂直切片指引） | 做分步迁移时 |
| `interview-me` | `constraint-driven-development`（**直接借用其一次一问的提问纪律**） | `constraint-driven-development` 探测项目现状时 |

### 优先级：承接方优先

B 组与承接方功能重叠时，**流程主导权仍在承接方**。需求对齐、规格、拆单、实现、测试、**发起**评审，
按 harness-creator 的「引导词场合判别」走 superpowers 或 mattpocock；B 组是**兜底**：承接方不在场、
或不具备对应能力时才用它。

**分支收尾、完成前验证、评审意见处置、并行委派、工作树隔离这五项已例外**——它们由 C 组直接承接（见第 3 节）。

| B 组技能 | 承接方对应能力 |
|---|---|
| `debugging-and-error-recovery` | superpowers `systematic-debugging` / mattpocock `diagnosing-bugs` |
| `code-review-and-quality` | mattpocock `code-review`（**发起**审查）；**收到意见之后**的处置见 C 组 `receiving-code-review` |
| `test-driven-development` | superpowers `test-driven-development` / mattpocock `tdd`（两者均未收录进本包） |
| `incremental-implementation` | mattpocock `implement` |
| `interview-me` | mattpocock `grilling` / `grill-me` |

## 3. C 组：把 superpowers 的 5 项能力收敛到本包

这 5 个来自 `obra/superpowers`。本机 superpowers 插件**当前仍装着**；逐项核对它与 mattpocock 的能力表后发现，
其余各项都已被 mattpocock 覆盖，**只剩这 5 项没有第二个具名落点**。把这 5 项收敛到本包，
是为了让 `/implement` 的执行纪律有**确定的归属**，而不是因为 superpowers 缺席。

**同名并存时以本包为准。** superpowers 那边这 5 个同名技能仍在技能表里，两处同时命中会争触发时机——
按本包处理，superpowers 那份视为同源副本。

| 阶段 | 技能 | 什么时候用 | 典型产出 |
|---|---|---|---|
| 起工单前 | `using-git-worktrees` | 开工前要隔离，不要在当前分支上直接改 | 隔离工作区 + 一份干净的基线测试结果 |
| 执行中 | `dispatching-parallel-agents` | 手上是 2 个以上**互不依赖**的工单或故障，要并发推进 | 每个问题域一个子代理，并行返回后统一复验 |
| 收到评审后 | `receiving-code-review` | 拿到评审意见、**准备动手改之前** | 逐条核实后的处置：照做 / 有依据地反驳 / 先问清再动 |
| 每次声明完成前 | `verification-before-completion` | 即将说出"做完了 / 通过了 / 能合了" | 新鲜的验证证据（命令 + 完整输出 + 退出码） |
| 收尾 | `finishing-a-development-branch` | 实现完成、测试通过，要决定怎么并回去 | 合并 / 提 PR / 保留分支——并执行对应收口 |

**两个容易混的边界**：

- `code-review`（mattpocock）负责**发起**独立审查；`receiving-code-review` 负责**收到意见之后**怎么核实与处置。两者前后接力，不重叠。
- `verification-before-completion` 是**通用铁律**（任何完成声明都要有新鲜证据）；它不替代具体领域的验证入口，后者仍然是 `init.sh` / CI（见第 5 节）。

### 宿主适配映射（必读）

这 3 处是上游按 Claude Code 写的，本机形态不同。技能正文一字未改，落点按下表：

| 上游原文 | 本机落点 | 说明 |
|---|---|---|
| `dispatching-parallel-agents` 里的 `Subagent (general-purpose): "…"` 派发写法 | 委派调用 + `agent_name` | 本机内置 `mavis` / `worker` / `explore` / `verifier`。按工单派**写入类**子任务用 `worker`（需独占文件），只读调查用 `explore`；**同一响应里发出多个委派调用即为并行**，逐个发就是串行。 |
| `using-git-worktrees` Step 1a 的"原生 worktree 工具"（`EnterWorktree` / `/worktree` / `--worktree`） | 本机无此工具 → 直接落到 Step 1b | 本机没有原生 worktree 命令，按 1b 的 `git worktree add` 走即可。Step 0 的隔离检测、Step 2 的依赖安装、Step 3 的基线验证照旧。 |
| `finishing-a-development-branch` Step 6 的 "Superpowers created this worktree — we own cleanup" | 判据是路径前缀，不是归属 | 该步骤的**实际判断条件**是工作树落在 `.worktrees/` 或 `worktrees/` 之下就归我们清理，否则留给宿主。正文里的 "Superpowers" 只是原作者对自己行为的称呼，照判据执行即可。 |

## 4. 悬空引用映射表

B 组自身还引用了 6 个**未收录**的上游技能。这些引用不继续 vendored（再收一跳会一路吞到 22/25，基本等于整仓），按下表解析。性质一栏决定了缺了它到底损失什么。

| 悬空引用 | 出现位置 | 性质 | 解析到 |
|---|---|---|---|
| `spec-driven-development` | `interview-me:129` | **真流程缺口**：让 agent 向用户 offer 用它起草规格 | mattpocock `to-spec` |
| `git-workflow-and-versioning` | `incremental-implementation:41` | **真流程缺口**：按它的原子提交指引提交 | **本包 C 组** `finishing-a-development-branch` / `using-git-worktrees`（见第 3 节）；合并冲突用 mattpocock `resolving-merge-conflicts` |
| `idea-refine` | `interview-me:14,190,235` | 交接落点：意图澄清后的下游交接 | 需求对齐阶段 → mattpocock `grilling` / `grill-me` |
| `spec-driven-development` | `interview-me:14,191,235` | 交接落点同上 | mattpocock `to-spec` |
| `planning-and-task-breakdown` | `interview-me:192` | 仅时间线说明：两跳下游 | mattpocock `to-tickets` |
| `doubt-driven-development` | `interview-me:14,193` | 仅对照说明：决策**后**的产物复核，与 interview-me 的决策前提取相对 | 审查/批判阶段 → mattpocock `code-review` / `grill-with-docs` |
| `source-driven-development` | `interview-me:194` | 仅对照说明：验证框架事实，与澄清意图正交 | mattpocock `research` |

**读法**：只有「真流程缺口」那两行会导致动作落空，必须按右列执行；「仅对照说明」缺失只损失解释力；「交接落点」按 harness-creator 原有的承接方规则走即可。

**C 组没有这一层**：5 个技能的正文不引用任何其它技能、不引用仓库级 `references/`、无同目录附属文件，闭包 5/5。

---

## 5. 与 harness-creator 的交界（唯一需要记住的三条）

harness-creator 的产物是 `AGENTS.md`（指令）与 `init.sh`（验证入口）。本插件**不接管**那两样东西，交界只有三处：

1. **`constraint-driven-development` 会往指令文件追加一行**
   `Read CONSTRAINTS.md before writing code. Do not weaken it to make a change pass.`
   这一行**落在指令子系统里**，会占用 `AGENTS.md` 的字节/行数/工作规则预算——追加后要回查预算是否仍然合规。

2. **验证入口始终是 `init.sh`，不是 `CONSTRAINTS.md`。**
   `CONSTRAINTS.md` 只回答"标准是什么"，"跑什么"仍然是 `init.sh` / CI。
   `constraint-driven-development`、`ci-cd-and-automation` 产出的门槛检查，应当被**接进** `init.sh` / CI，而不是另立一套命令。
   C 组的 `verification-before-completion` 同理：它要求"证据先行"，但**跑哪条命令**仍由项目自己的 `init.sh` / CI 决定。

3. **本索引不新增分流键。**
   需求对齐、规格、拆单、实现、测试、发起代码审查仍按 harness-creator 原有的承接方规则走；
   本插件只覆盖上表里的**工程阶段**能力。

## 6. 共享清单在哪

技能正文用相对路径（从 `skills/<name>/` 出发指向包根）引用仓库级共享清单。上游按单 skill 安装**不会**带上这些文件，因此本插件已把它们放在 `references/`：

| 文件 | 被谁引用 |
|---|---|
| `references/security-checklist.md` | `security-and-hardening`、`shipping-and-launch` |
| `references/performance-checklist.md` | `performance-optimization`、`shipping-and-launch` |
| `references/accessibility-checklist.md` | `frontend-ui-engineering`、`shipping-and-launch` |
| `references/observability-checklist.md` | `observability-and-instrumentation` |
| `references/definition-of-done.md` | `shipping-and-launch` |
| `references/testing-patterns.md` | `test-driven-development` |

引用路径与包结构一致，**因此技能正文一个字都没有改**——这正是本插件能一键覆盖式跟上游更新的原因。
这 6 份只服务 A / B 组；C 组 5 个技能不需要任何共享清单。

## 7. 前置条件

- `browser-testing-with-devtools` 需要 **chrome-devtools MCP server**。没有它，这个技能不可用；本包不内置该 MCP。
- C 组 `dispatching-parallel-agents` 的并行依赖本机的子代理委派能力；`using-git-worktrees` 没有可用的原生 worktree 工具（两者落点见第 3 节适配表）。

## 8. 本索引不做什么

- 不代任何技能下结论，也不替 `harness-creator` 决定何时触发 harness 产物。
- 不引入第二套路由：上表只是"哪个技能管哪一段"的对照表，不是新的分流规则。
- 不重复上游正文；被指向后直接读那个技能的 `SKILL.md`。
- **不承诺上游引用闭包完整**：B 组的二跳引用按第 4 节的表解析，不是靠收更多技能解决的。

## 9. 更新到上游最新版

```bash
node scripts/update-upstream.mjs --check    # 只看两个上游的差异，不写文件
node scripts/update-upstream.mjs --apply    # 同步两个上游并镜像到安装目录
node scripts/update-upstream.mjs --apply --only superpowers   # 只同步一个上游
```

`skills/` 下这 20 个目录、`references/`、`licenses/` 下两份许可全文，都是两个上游的**逐字节副本**，
请不要在本地改写它们——脚本会检测本地漂移并拒绝覆盖。
各上游的锁定 commit 与逐文件 sha256 见 `upstream.lock.json` 的 `sources.<id>`。
