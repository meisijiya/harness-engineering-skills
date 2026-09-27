---
name: harness-engineering-skills-index
description: Index and routing map for the nine harness-governed engineering skills bundled in this plugin. Use when you need to decide which of the nine to load, when you are unsure whether a task belongs to security hardening, performance optimization, frontend engineering, browser verification, CI/CD, observability, release, deprecation, or constraint-driven development, or when you need to know how these nine hand work to harness-creator's AGENTS.md and init.sh. Use it to route, not to execute — the actual procedure always lives in the target skill.
---

# Harness 工程技能集 · 索引

本插件打包了 `addyosmani/agent-skills` 中 **9 个**与 `harness-creator` 治理体系不重叠的工程技能。
本文件**只做索引与路由**，不含任何工作规则；真正要执行的流程始终在被指向的那个技能里。

---

## 1. 路由表：什么时候用哪一个

| 阶段 | 技能 | 什么时候用 | 典型产出 |
|---|---|---|---|
| 全程基线 | `constraint-driven-development` | 质量标准没写下来；代理开始塞 `@ts-ignore`、删测试、降阈值来"变绿" | `CONSTRAINTS.md`（Floor / 有数字强制 / 已测量未强制 / 例外 四段） |
| 写代码时 | `security-and-hardening` | 处理不可信输入、认证会话、外部集成、依赖审计、个人数据合规 | 威胁建模 + Always Do / Ask First / Never Do 三层边界 |
| 写代码时 | `performance-optimization` | 有性能指标要求；怀疑性能回归；Core Web Vitals / 加载时间 / N+1 查询 | 测量 → 定位瓶颈 → 修反模式 → 验证并**决定保留或回滚** → 防回归 |
| 写界面时 | `frontend-ui-engineering` | 做组件、布局、状态；WCAG 无障碍；产出需要"像人做的"而不是 AI 味的界面 | 组件结构 + 设计系统遵从 + WCAG 2.1 AA |
| 运行时 | `browser-testing-with-devtools` | 需要真实浏览器证据：DOM、控制台报错、网络请求、性能 trace、视觉核对 | Chrome DevTools MCP 的实测数据（**需先配好该 MCP**） |
| 交付机制 | `ci-cd-and-automation` | 要把质量门禁自动化；搭或改流水线；配测试运行器；定部署策略 | 质量门禁流水线 + GitHub Actions + 分阶段发布与回滚 |
| 上线后 | `observability-and-instrumentation` | 加日志/指标/追踪/告警；**特性要带遥测一起上线**；线上问题查不出发生了什么 | 日志 + 指标 + 追踪 + 告警（含 runbook） |
| 上线动作 | `shipping-and-launch` | 准备发布；要预发布清单；要特性开关 / 分阶段 / 错误预算闸门 / 回滚策略 | 预发布清单 + 发布序列 + 回滚策略 |
| 生命周期 | `deprecation-and-migration` | 删旧系统/旧 API/旧特性；不停机改库表列（expand/contract）；清理僵尸代码 | 弃用决策 + 迁移步骤 + 绞杀者/适配器等迁移模式 |

---

## 2. 与 harness-creator 的交界（唯一需要记住的三条）

harness-creator 的产物是 `AGENTS.md`（指令）与 `init.sh`（验证入口）。这 9 个技能**不接管**那两样东西，交界只有三处：

1. **`constraint-driven-development` 会往指令文件追加一行**
   `Read CONSTRAINTS.md before writing code. Do not weaken it to make a change pass.`
   这一行**落在指令子系统里**，会占用 `AGENTS.md` 的字节/行数/工作规则预算——追加后要回查预算是否仍然合规。

2. **验证入口始终是 `init.sh`，不是 `CONSTRAINTS.md`。**
   `CONSTRAINTS.md` 只回答"标准是什么"，"跑什么"仍然是 `init.sh` / CI。
   `constraint-driven-development`、`ci-cd-and-automation` 产出的门槛检查，应当被**接进** `init.sh` / CI，而不是另立一套命令。

3. **本索引不新增分流键。**
   需求对齐、规格、拆单、实现、测试、代码审查、分支收尾仍按 harness-creator 原有的承接方规则走；本插件只覆盖上表里的**工程阶段**能力。

---

## 3. 共享清单在哪

这 9 个技能正文里用 `../../references/x.md` 引用仓库级共享清单。上游按单 skill 安装**不会**带上这些文件，因此本插件已把它们放在 `references/`：

| 文件 | 被谁引用 |
|---|---|
| `references/security-checklist.md` | `security-and-hardening`、`shipping-and-launch` |
| `references/performance-checklist.md` | `performance-optimization`、`shipping-and-launch` |
| `references/accessibility-checklist.md` | `frontend-ui-engineering`、`shipping-and-launch` |
| `references/observability-checklist.md` | `observability-and-instrumentation` |
| `references/definition-of-done.md` | `shipping-and-launch` |

引用路径与包结构一致，**因此技能正文一个字都没有改**——这正是本插件能一键覆盖式跟上游更新的原因。

---

## 4. 前置条件

- `browser-testing-with-devtools` 需要 **chrome-devtools MCP server**。没有它，这个技能不可用；本包不内置该 MCP。

---

## 5. 本索引不做什么

- 不代任何技能下结论，也不替 `harness-creator` 决定何时触发 harness 产物。
- 不引入第二套路由：上表只是"哪个技能管哪一段"的对照表，不是新的分流规则。
- 不重复上游正文；被指向后直接读那个技能的 `SKILL.md`。

---

## 6. 更新到上游最新版

```bash
node scripts/update-upstream.mjs --check    # 只看差异，不写文件
node scripts/update-upstream.mjs --apply    # 同步上游并镜像到安装目录
```

`skills/` 下这 9 个目录与 `references/` 是上游的**逐字节副本**，请不要在本地改写它们——脚本会检测本地漂移并拒绝覆盖。当前锁定的上游 commit 见 `upstream.lock.json`。
