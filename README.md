# Harness 工程技能集（harness-engineering-skills）

从 [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) 里挑出的 **14 个**工程技能，
打包成一个 MiniMax 本地插件，放在 `harness-creator` 治理体系（`AGENTS.md` + `init.sh`）之下用。

- 14 个技能正文 = 上游**逐字节副本**，本地零改写
- 补齐上游单装会丢的 6 份仓库级共享清单
- 一条命令跟上游最新版

> **本仓库是公开参考副本**：完整包都在本仓——14 个上游技能正文（逐字节副本）、6 份仓库级共享清单、
> 同步脚本、锁文件、文档与图标。仓库根目录即包本体；安装到 MiniMax Code 的那份由
> `scripts/update-upstream.mjs --install` 镜像生成，不单独维护。

## 里面有什么

技能分两组，**收录依据不同**：

### A 组 · 精选 9 个

按三条准则选出：与 harness-creator 承接方不重复、不侵入 instructions/verification/scope 三子系统、
工程阶段真实净增量。

| 技能 | 阶段 | 一句话 |
|---|---|---|
| `constraint-driven-development` | 全程基线 | 把质量标准写成带数字的 `CONSTRAINTS.md`，盯 diff 里被悄悄降标的地方 |
| `security-and-hardening` | 写代码 | 威胁建模 + Always Do / Ask First / Never Do 三层边界 |
| `performance-optimization` | 写代码 | 先测量再优化；验证后还要**决定保留或回滚** |
| `frontend-ui-engineering` | 写界面 | 生产级、无障碍、响应式，且不像 AI 生成的 |
| `browser-testing-with-devtools` | 运行时 | 用 Chrome DevTools MCP 拿真实浏览器证据（**需先配该 MCP**） |
| `ci-cd-and-automation` | 交付机制 | 把质量门禁自动化，Shift Left + 小批量高频发布 |
| `observability-and-instrumentation` | 上线后 | 特性与遥测一起上线；告警带 runbook |
| `shipping-and-launch` | 上线动作 | 可逆、可观察、增量地发布；错误预算闸门 |
| `deprecation-and-migration` | 生命周期 | 代码是负债；不停机改列（expand/contract）与绞杀者模式 |

### B 组 · 引用闭包 5 个

**不满足**上述准则（与承接方有功能重叠），收它们只为让 A 组正文里的引用有着落——
A 组 9 个共 11 处引用指向这 5 个，不收进来代理会去找不存在的技能。

`debugging-and-error-recovery`、`code-review-and-quality`、`test-driven-development`、
`interview-me`、`incremental-implementation`

**优先级：承接方优先，B 组兜底。** 这 5 个与 superpowers / mattpocock 家族重叠，
流程主导权仍在承接方（按 harness-creator 的引导词场合判别），B 组只在承接方不在场时启用。

### 索引与映射

自写纯索引 `harness-engineering-skills-index`（**不含任何工作规则**）负责三件事：

1. A 组路由表：什么时候用哪一个；
2. 承接方优先级表；
3. **悬空引用映射表**——B 组自身还引用 6 个未收录的上游技能。传递闭包实测是 22/25，
   收满等于搬平整仓且会带入与 harness-creator 冲突的 `context-engineering`，因此**只收一跳**，
   二跳引用按性质（真流程缺口 / 交接落点 / 仅对照说明）解析到实际承接方。

细节与实测数据见 `PROVENANCE.md`。

## 装在哪

- **包本体（源码）**：`D:\26code\agent-skills` ← 改这里
- **安装目录（运行）**：`C:\Users\22923\.minimax\plugins\harness-engineering-skills`

两者由脚本保持一致；**日常只改包本体，然后重装**。

## 首次使用

1. 确认插件已被识别：MiniMax Code 的本地插件列表里应出现 `harness-engineering-skills`。
2. 不知道该用哪个 → 读 `skills/harness-engineering-skills-index/SKILL.md`。
3. 与 harness-creator 的落地顺序：`constraint-driven-development` 先定 `CONSTRAINTS.md` 与那一行指令 →
   `ci-cd-and-automation` 把同类检查接进 `init.sh` / CI → 其余按当前项目实际面启用。

> 边界一句话：**验证入口始终是 `init.sh`**，`CONSTRAINTS.md` 只回答"标准是什么"。

## 更新到上游最新版

```bash
cd D:\26code\agent-skills

node scripts/update-upstream.mjs --check    # 看上游有没有变化，不写任何文件
node scripts/update-upstream.mjs --apply    # 同步到上游最新版，并自动镜像到安装目录
node scripts/update-upstream.mjs --install  # 不联网，只把当前包重装到安装目录
```

常用参数：`--ref <branch|tag|sha>`、`--install-dir <path>`、`--force`（丢弃本地改写）、
`--keep-temp`（保留临时目录便于排查）。

行为约定：

- 只解包上游的 `skills/`、`references/`、`LICENSE` 三块（上游归档含符号链接，Windows tar 建不出来）；
- 按 commit 下载归档（`main` 只是解析入口），**内容不可变**；
- 同步前先做**漂移检测**：若本地改过任何一个受管文件，默认中止并列出改动，
  确认要丢弃再加 `--force`；
- 上游删除的文件会被清掉，上游新增的文件会被带上；
- 同步完自动镜像到安装目录（安装目录已存在且 manifest 不匹配时会拒绝写入）。

## 自检

```bash
node --check scripts/update-upstream.mjs      # 语法
node scripts/update-upstream.mjs --check     # 漂移 + 上游差异，应为「已是最新 / 漂移 0 处」
```

校验完 `--check` 不应出现任何 `+ ~ -` 变更行。

## 注意

- `browser-testing-with-devtools` 依赖 **chrome-devtools MCP server**，本包不内置该 MCP。
- 上游为 **MIT (c) 2025 Addy Osmani**，本包保留原许可与声明，见 `LICENSE` 与 `PROVENANCE.md`。
- 请不要在本地改写 `skills/` 下那 14 个目录和 `references/`——它们是上游副本，改了就失去一键更新。
