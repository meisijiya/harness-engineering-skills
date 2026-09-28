# Harness 工程技能集（harness-engineering-skills）

从两个上游精选的 **20 个**通用工程技能，打包成一个 MiniMax 本地插件，
放在 `harness-creator` 治理体系（`AGENTS.md` + `init.sh`）之下用。

- **[addyosmani/agent-skills](https://github.com/addyosmani/agent-skills)** —— 15 个（10 精选 + 5 引用闭包）+ 6 份仓库级共享清单
- **[obra/superpowers](https://github.com/obra/superpowers)** —— 5 个（补 mattpocock 侧的空缺）

**定位：补强 `mattpocock-skills` 在 `harness-creator` 治理下的能力。**
补的是它没有的**通用工程能力**（与语言、框架、数据库无关）——本包 20 个技能与本机
mattpocock-skills 的 25 个**零同名重叠**，这是「补强」的机器口径。
需求对齐、规格、拆单、实现、测试、发起评审的主导权仍在 mattpocock，本包不引入第二套流程入口。
栈相关技能（LangChain4j、Postgres 专属规则集、具体框架调优）一律不入本包，随项目按需安装——
否则插件会迅速臃肿，且栈相关内容的保质期远短于通用工程纪律。

- 20 个技能正文 = 两个上游的**逐字节副本**，本地零改写
- 补齐上游单装会丢的 6 份仓库级共享清单
- 一条命令同时跟两个上游的最新版

> **本仓库是公开参考副本**：完整包都在本仓——20 个上游技能正文（逐字节副本）、6 份仓库级共享清单、
> 2 份上游许可全文、同步脚本、锁文件、文档与图标。仓库根目录即包本体；安装到 MiniMax Code 的那份由
> `scripts/update-upstream.mjs --install` 镜像生成，不单独维护。

## 里面有什么

技能分三组，**收录依据各不相同**：

### A 组 · 精选 10 个（addyosmani）

按三条准则选出：与 harness-creator 承接方不重复、不侵入 instructions/verification/scope 三子系统、
工程阶段真实净增量。

| 技能 | 阶段 | 一句话 |
|---|---|---|
| `constraint-driven-development` | 全程基线 | 把质量标准写成带数字的 `CONSTRAINTS.md`，盯 diff 里被悄悄降标的地方 |
| `api-and-interface-design` | 定接口 | REST / GraphQL 端点设计、模块边界、模块间类型契约（原 9 个里完全空白的一域，v1.2.0 复议补录） |
| `security-and-hardening` | 写代码 | 威胁建模 + Always Do / Ask First / Never Do 三层边界 |
| `performance-optimization` | 写代码 | 先测量再优化；验证后还要**决定保留或回滚** |
| `frontend-ui-engineering` | 写界面 | 生产级、无障碍、响应式，且不像 AI 生成的 |
| `browser-testing-with-devtools` | 运行时 | 用 Chrome DevTools MCP 拿真实浏览器证据（**需先配该 MCP**） |
| `ci-cd-and-automation` | 交付机制 | 把质量门禁自动化，Shift Left + 小批量高频发布 |
| `observability-and-instrumentation` | 上线后 | 特性与遥测一起上线；告警带 runbook |
| `shipping-and-launch` | 上线动作 | 可逆、可观察、增量地发布；错误预算闸门 |
| `deprecation-and-migration` | 生命周期 | 代码是负债；不停机改列（expand/contract）与绞杀者模式 |

### B 组 · 引用闭包 5 个（addyosmani）

**不满足**上述准则（与承接方有功能重叠），收它们只为让 A 组正文里的引用有着落——
原 9 个（补录 `api-and-interface-design` 之前）共 11 处引用指向这 5 个，不收进来代理会去找不存在的技能。

`debugging-and-error-recovery`、`code-review-and-quality`、`test-driven-development`、
`interview-me`、`incremental-implementation`

**这 5 个是引用闭包，不是重点。** 它们被 A 组正文直接引用，不收进来代理会去找不存在的技能；
真正用到的场景是「这次要动测试 / 要自查改动 / 要探测项目现状」，其余时候先看 A 组。

### C 组 · 承接空缺 5 个（superpowers，v1.3.0 新增）

这 5 项在 mattpocock 侧**没有具名对应**——按本机已装的 mattpocock-skills 25 个技能逐个核对确认。
本机 superpowers 插件仍装着，收这 5 个不是救火，而是让这 5 项能力有**确定的归属**，
避免同一能力两处候选、触发时机随上下文漂移。**同名并存时以本包为准。**

| 技能 | 阶段 | 一句话 |
|---|---|---|
| `using-git-worktrees` | 起工单前 | 先检测是否已隔离，再用 git worktree 建隔离工作区并跑一次干净基线 |
| `dispatching-parallel-agents` | 执行中 | 一个问题域一个子代理并发推进；串行处理互不依赖的失败纯属浪费时间 |
| `receiving-code-review` | 收到评审后 | 先核实再动手；不表演性赞同，不盲目实现，技术正确优先于社交舒适 |
| `verification-before-completion` | 每次声明完成前 | 没有本次跑出来的验证证据，就不能说"通过了" |
| `finishing-a-development-branch` | 收尾 | 验证 → 识别环境 → 给合并/提 PR/保留三选一 → 执行 → 清理 |

这一组的正文**零悬空引用**（不引用其它技能、不引用仓库级 references、无附属文件），闭包 5/5。
上游按 Claude Code 写的 3 处宿主相关表述（`Subagent (general-purpose)` 派发、原生 worktree 工具、
"Superpowers created this worktree"）在本机的落点写在索引的**宿主适配映射**里，正文一字未改。

> ⚠️ **执行方式先与用户商定。** 隔离（`using-git-worktrees`）与并行委派（`dispatching-parallel-agents`）
> **不自动触发**：命中时先把选项摆给用户、达成一致再进技能正文。一个 ticket 的 implement 用什么方式推进
> 是用户的决定，不是这两个技能的默认值——具体问什么见入口第 2 节的**执行方式闸门**。

### 入口与映射

自写入口 `using-harness-engineering-skills`（只做路由与闸门，不代替任何技能执行）负责六件事，
**入口是任务维度**——代理拿到一句话，先翻「我正在做什么」那张表，不用先理解 A/B/C 分组：

1. **强制姿态**（作用域 = **动手改代码之前**）：本包技能「1% 可能相关」就必须点名，含在回答澄清提问之前；
   表里没有的行**直接说不归本包**，不拿近似技能顶替。配 6 条**自欺红旗**表；
2. **🔴 执行方式闸门**：工作树隔离与并行委派在动手前要先与用户商定什么（未确认前只派只读调查）；
3. **任务维度路由表**（19 行，带症状词）：`我在做什么 → 点名哪个`，并标明哪些不归本包；
4. **🛑 反例黑名单**（8 条）：这么用这个包会出什么事，含实测中出现过的「把 20 个技能当清单倒给用户」；
5. **if-then 兜底表**（三列两段，10 行）：表里没匹配上、同时像好几行、MCP 缺失、子代理根因重合、
   隔离与委派代码范围重叠……，每行都给了「仍失败时」的下一跳；
6. **宿主适配映射** + 三个附录（A 分组依据 / 悬空引用映射 / harness-creator 交界与共享清单）。

命名对齐 `obra/superpowers` 的 `using-superpowers`——`using-<产品名>` 是上游对「入口技能」的约定。
**正文不引用任何其他插件的技能名**：本包只声明自己覆盖哪些工程能力，不归本包的直接说清楚。

细节与实测数据见 `PROVENANCE.md`。

## 装在哪

- **包本体（源码）**：`D:\26code\agent-skills` ← 改这里
- **安装目录（运行）**：`C:\Users\22923\.minimax\plugins\harness-engineering-skills`

两者由脚本保持一致；**日常只改包本体，然后重装**。

## 首次使用

1. 确认插件已被识别：MiniMax Code 的本地插件列表里应出现 `harness-engineering-skills`。
2. 不知道该用哪个 → 读 `skills/using-harness-engineering-skills/SKILL.md`。
3. 与 harness-creator 的落地顺序：`constraint-driven-development` 先定 `CONSTRAINTS.md` 与那一行指令 →
   `ci-cd-and-automation` 把同类检查接进 `init.sh` / CI → 其余按当前项目实际面启用。
4. 要推进一个 ticket：需求对齐 / 拆单走 mattpocock（`grilling` / `to-tickets`），
   实现阶段的**隔离与委派方式先问用户**（见上面 C 组的提示）。

> 边界一句话：**验证入口始终是 `init.sh`**，`CONSTRAINTS.md` 只回答"标准是什么"。

## 更新到上游最新版

```bash
cd D:\26code\agent-skills

node scripts/update-upstream.mjs --check    # 看两个上游有没有变化，不写任何文件
node scripts/update-upstream.mjs --apply    # 同步两个上游到最新版，并自动镜像到安装目录
node scripts/update-upstream.mjs --install  # 不联网，只把当前包重装到安装目录

node scripts/update-upstream.mjs --check --only superpowers   # 只看一个上游
```

常用参数：`--only <source>`、`--ref <branch|tag|sha>`、`--install-dir <path>`、
`--force`（丢弃本地改写）、`--keep-temp`（保留临时目录便于排查）。

行为约定：

- 每个上游只解归档它自己需要的那几块（`agent-skills` 解 `skills` + `references` + `LICENSE`，
  `superpowers` 解 `skills` + `LICENSE`）；上游归档含符号链接，Windows 的 tar 建不出来；
- 按 commit 下载归档（`main` 只是解析入口），**内容不可变**；
- 同步前先做**漂移检测**：若本地改过任何一个受管文件，默认中止并列出改动，
  确认要丢弃再加 `--force`；
- 上游删除的文件会被清掉，上游新增的文件会被带上；
- 同步完自动镜像到安装目录（安装目录已存在且 manifest 不匹配时会拒绝写入）；
- 锁文件按上游分条目记录（`sources.agent-skills` / `sources.superpowers`），各锁各的 commit。

## 自检

```bash
node --check scripts/update-upstream.mjs      # 语法
node --check scripts/check-ref-table.mjs      # 语法
node scripts/check-ref-table.mjs             # 索引附录 C 的「被谁引用」表 vs 各技能正文实际引用
node scripts/update-upstream.mjs --check     # 漂移 + 上游差异，应为「已是最新 / 漂移 0 处」
```

`check-ref-table.mjs` 是**改 `references/` 或动那张引用表之后必跑**的：那张表一旦写成对照形式
就成了断言，漏列会让下一个人裁掉仍在用的清单。它历史上确实漏过 3 处，跨 3 个版本都没人发现。
`--check` 跑完不应出现任何 `+ ~ -` 变更行，结论行应为
`2 个上游 / 30 个受管文件，0 处变化，漂移 0 处`。

## 许可

- 自写部分（manifest、图标、脚本、索引、文档）：MIT，见根目录 `LICENSE` 第一节。
- vendored 技能：两个上游均为 MIT——Copyright (c) 2025 Addy Osmani、Copyright (c) 2025 Jesse Vincent，
  许可全文逐字节保留在 `licenses/agent-skills-LICENSE` 与 `licenses/superpowers-LICENSE`。
  逐文件归属见 `upstream.lock.json` 的 `sources.<id>.managed`。

## 注意

- `browser-testing-with-devtools` 依赖 **chrome-devtools MCP server**，本包不内置该 MCP。
- 请不要在本地改写 `skills/` 下那 20 个目录、`references/`、`licenses/`——
  它们是上游副本，改了就失去一键更新。
