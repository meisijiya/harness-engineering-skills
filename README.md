# harness-engineering-skills

给 AI 编码代理用的**通用工程技能集**：从两个上游开源仓库精选 14 个与语言、框架、数据库无关的工程技能，
逐字节 vendored 进本包，再加本地维护的入口技能与 `old-code`，共 16 个技能。打包成一个插件，同时供
MiniMax Code、omp、Claude Code 三个生态使用。

| 构成 | 数量 | 说明 |
|---|---|---|
| vendored 技能 | 14 | 上游正文逐字节副本，本地零改写，可一条命令同步回上游最新版（addyosmani 9 + superpowers 5） |
| 自写入口技能 | 1 | `using-harness-engineering-skills`，只做路由与闸门，不代替任何技能执行；工单实现期另有一张阶段必查表 |
| 独立维护技能 | 1 | `old-code`，围绕真实代码做推演、核验与学习，帮助用户保持独立维护能力 |
| 仓库级共享清单 | 5 | 上游按仓库组织、安装单个技能时拿不到的引用目标 |
| 上游许可全文 | 2 | 两个上游均为 MIT |

来源与逐文件归属见 [`PROVENANCE.md`](PROVENANCE.md) 与 `upstream.lock.json`（逐文件 sha256 锁）。
上游是 [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills)（9 个技能 + 5 份共享清单）
与 [obra/superpowers](https://github.com/obra/superpowers)（5 个技能），两者均为 MIT。

## 定位

**这个包是补强，不是另一套流程。**

它补的是流程类技能里缺位的**通用工程能力**——安全加固、性能测量、接口契约、可观测性、
发布与迁移这类与具体技术栈无关的纪律。收录时**只收承接方没有的能力**：已有承接方的技能一律让位，
不做同名或同能力的第二份，所以两个插件不会在触发时机上抢同一件事。需求对齐、规格、拆单、
实现编排、测试流程、发起评审的主导权仍在流程类技能，本包不引入第二套流程入口。

**收录标准只有一条：与语言、框架、数据库无关。**
LangChain4j 规则集、Postgres 专属调优、某个前端框架的写法这类栈相关内容一律不入本包，
随各项目按需安装——否则插件会迅速臃肿，而栈相关内容的保质期远短于通用工程纪律。

不覆盖的：需求与规格文档、issue/ticket 管理、根因排查与调试、质量基线与指令文件、验证入口的设置、
代码库探索与映射、具体框架的 API 用法。

## 覆盖哪些能力

按能力域分组。**何时触发哪个技能由入口技能路由**（下表是覆盖范围，不是触发表——
完整路由见 `skills/using-harness-engineering-skills/SKILL.md`）。

| 能力域 | 技能 | 解决什么 | 来源 |
|---|---|---|---|
| 入口路由 | `using-harness-engineering-skills` | 工单实现期按阶段逐行必查；单点工程动作按能力域找行；判断执行方式要不要先与用户商定 | 本包自写 |
| 代码掌控与学习 | [`old-code`](skills/old-code/README.md) | 跟进 AI 改动，独立预测关键行为，用证据检验并练习维护；可按用户节奏跳过测验 | 本包独立编写；理念来自 zjw-swun/old-code |
| 接口与契约 | `api-and-interface-design` | 设计端点、模块边界与类型契约，让调用方先签下可执行的接口形状 | addyosmani |
| 安全 | `security-and-hardening` | 威胁建模 + Always Do / Ask First / Never Do 三层动作边界 | addyosmani |
| 性能 | `performance-optimization` | 先测量再优化，且用复测数据决定保留还是回滚 | addyosmani |
| 界面 | `frontend-ui-engineering` | 生产级、无障碍、响应式的界面实现 | addyosmani |
| 交付与运维 | `ci-cd-and-automation`、`shipping-and-launch`、`observability-and-instrumentation`、`deprecation-and-migration` | 质量门禁自动化；可逆可观察地发布；特性与遥测一起上线；不停机改列与绞杀者模式 | addyosmani |
| 浏览器验证 | `browser-testing-with-devtools` | 用 Chrome DevTools MCP 拿真实浏览器证据，而不是只看代码自洽 | addyosmani |
| 评审意见处置 | `receiving-code-review` | 收到评审意见先核实再动手，不表演性赞同 | superpowers |
| 执行方式与收尾 | `using-git-worktrees`、`dispatching-parallel-agents`、`verification-before-completion`、`finishing-a-development-branch` | 起工前建隔离工作区；一个问题域一个子代理并发推进；没有本次证据不说完成；验证→合并/PR/保留三选一 | superpowers |

入口技能的两条默认行为值得单独知道：

- **工作树隔离与并行委派不自动触发。** 命中时先把选项摆给用户，达成一致再进技能正文。
  一个工单用什么方式推进是用户的决定，不是这两个技能的默认值。
- **不引用其它插件的技能名。** 入口只声明自己覆盖哪些能力，不归本包的直接说清楚。

## 仓库里有什么

仓库根目录**就是包本体**。安装到各生态的那份由脚本镜像生成，不单独维护。

```
skills/                     16 个技能目录（14 vendored + 1 自写入口 + 1 独立维护 old-code）
references/                 5 份仓库级共享清单（vendored）
licenses/                   两个上游的许可全文（vendored）
scripts/
  update-upstream.mjs       双上游同步 / 安装目录镜像
  check-ref-table.mjs       共享清单引用表对账（门禁）
  check-package.mjs         规范符合性、清单、版本、vendored 字节与本地技能归属校验（门禁）
upstream.lock.json          两个上游的 commit + 23 个受管文件的逐文件 sha256
plugin.json                 **Agent Plugins 1.0.0 根 manifest**（规范 §5.1 强制要求，见下）
.minimax-plugin/plugin.json  MiniMax Code 插件清单（含图标）
.claude-plugin/plugin.json   Claude Code 插件清单
package.json                npm 包描述 + omp 原生插件标记
icon.jpg / icon-dark.jpg    插件图标（浅色 / 深色）
init.sh                     验证门禁入口
LICENSE                     自写部分的许可 + 两个上游的归属声明
PROVENANCE.md               选型依据、实测数据、逐文件归属
AGENTS.md                   本仓库的开发约定与工作规则
artifacts/                  评审与调优过程的留档结果
```

### 清单文件与各自生态

| 文件 | 谁读它 | 作用 |
|---|---|---|
| `plugin.json` | 所有实现 Agent Plugins 1.0.0 的客户端，含 omp | **根 manifest**。规范 §4.1.2 与 §5.1 把「插件根目录必须有 `plugin.json`」定为符合性底线，§5.2 规定其顶层字段集封闭 |
| `.minimax-plugin/plugin.json` | MiniMax Code | 插件列表、图标与示例查询；显式列出 16 条 `skills/.../SKILL.md` |
| `.claude-plugin/plugin.json` | Claude Code | 同样的技能清单，供其按 `skills` 字段发现 |
| `package.json` | omp | `omp` 字段是 omp 的原生插件标记；`omp install` 也要求它存在 |

**符合性不是一次性检查，是门禁。** `scripts/check-package.mjs` 每次运行都按规范原文校验：

- `plugin.json` 的 `$schema` 必须是规范规定的 1.0.0 规范标识（§5.3）；顶层字段不得越出封闭集（§5.2）；
  `author` 只允许 `name`/`email`/`url`（§5.4）；`name` 必须满足 §5.5 的长度、字符集、首尾与重复约束。
- 每个 `skills/*/SKILL.md` 的 frontmatter 字段集必须落在 Agent Skills 规范
  （<https://agentskills.io/specification>）允许的六个键内；`name` 必须与目录名一致且合命名规则；
  `description` 长度 1–1024；`compatibility` 不超过 500 字符。Agent Plugins §7.1 把技能格式的判定权交给
  Agent Skills 规范，所以校验按那份规范走。

> **关于 MiniMax Code 的图标取舍。**
> MiniMax Code 的清单优先级是「有效的 Agent Plugins 1.0.0 **根 `plugin.json`** 优先，其次才轮到
> `.minimax-plugin/`」。而 Agent Plugins 1.0.0 的 schema **没有 `icon` / `darkIcon` 字段，且
> `additionalProperties: false`**——合规的根 manifest 在标准内**无法**携带图标。按已记录的行为，
> 两者共存时 MiniMax 会读根 manifest、拿不到图标、于是回退成仓库图标。
>
> 本包选择**保留根 `plugin.json`**：规范符合性是分发到任意 Agent Plugins 客户端的前提，
> 而图标只是展示。`.minimax-plugin/plugin.json` 仍然保留并配好图标，一旦 MiniMax 调整优先级即可生效。
> 若日后确认 MiniMax 图标确实因此失效，把 `plugin.json` 改名即可回退——但那样本包就**不再**声称
> 符合 Agent Plugins 1.0.0，两者是取舍关系，不能同时满足。

**不要在本地改写 `skills/` 下那 14 个 vendored 目录、`references/`、`licenses/`。**
它们是上游副本，改了就失去一键更新；同步脚本会在覆盖前做漂移检测并要求你显式 `--force`。
要改行为就改本地维护的部分（入口技能、`old-code`、脚本、清单、文档）。
`old-code` 不纳入上游同步，规则与评估由本包独立维护；理念来源与许可处理见 `PROVENANCE.md` 的 1d 节。

## 安装

**先看你要装进什么。** 四条路径互不冲突，同一个仓库可以同时装进多个生态——它们读的是不同的清单文件。

| 目标客户端 | 读哪个清单 | 安装动作 |
|---|---|---|
| 任意 Agent Plugins 1.0.0 客户端 | `plugin.json` | 把仓库目录（或其拷贝）放进该客户端的插件目录 |
| omp | `package.json` 的 `omp` 字段 + `plugin.json` | `omp install .` |
| Claude Code | `.claude-plugin/plugin.json` | 放置本包目录即可 |
| MiniMax Code | `.minimax-plugin/plugin.json` | `node scripts/update-upstream.mjs --install` 镜像 |

装完统一用一条命令验收（见下面「装完怎么验」）。

### 任意 Agent Plugins 1.0.0 客户端

本包的插件根目录**就是仓库根目录**，无需构建、无需编译、没有生成步骤。规范 §4.2 的标准布局：

```text
harness-engineering-skills/          ← 插件根目录
├── plugin.json                      ← 规范 §5.1 强制的根 manifest
├── skills/                          ← 规范 §6.1 固定的技能位置
│   └── <技能名>/SKILL.md              ← 16 个，只扫一层，不递归
├── references/                      ← 技能正文按 ../../references/ 引用的共享清单
├── LICENSE
└── ...
```

客户端**只需要** `plugin.json` 与 `skills/`；其余目录对本规范而言是包内容（§4.1.3 要求路径解析不得
逃出插件根，本包所有引用都在根内）。

本包不捆绑 `mcp.json`，即不提供任何 MCP server。规范 §6.2 明确规定固定位置缺失**不是错误**，
客户端应继续加载其它组件类型——所以没有 MCP 不影响符合性。
（`browser-testing-with-devtools` 这个技能会用到 chrome-devtools MCP，但那是**使用者自己**要配的依赖，
不是本插件捆绑的组件。）

要装进别的 Agent Plugins 客户端，把这个目录拷到该客户端约定的插件目录即可；无需改任何文件。
若客户端拒绝加载，按规范 §5.2 与 §7.1 依次自查：先看根 `plugin.json` 的字段与 `name`，
再看每个 `skills/*/SKILL.md` 的 frontmatter。

### omp

```powershell
cd <包目录>
omp install .            # 走 link 路径，不是 npm 拷贝
omp plugin doctor        # plugin:harness-engineering-skills 应为 ✔；本包实测 4 ok / 0 warnings / 0 errors
omp plugin list
omp skill list           # 这一条才是「omp 真的发现了技能」的证据
```

`omp install .` 对本地路径走 link：它在 `~/.omp/plugins/node_modules/harness-engineering-skills`
建一个指向本包的目录联接（Windows 上是 junction），并写入一条 enabled 的运行时记录。
**因此改动包本体后无需重装**，下次启动即生效；重跑 `omp install .` 只是幂等保险。回退：

```powershell
omp plugin uninstall harness-engineering-skills
```

omp 的发现路径有两条，都在本包上成立：

1. **认领插件**靠 `package.json` 的 `omp` 字段。缺了它 `omp install` 直接报
   `package.json not found` 装不上；缺了它但装了，`omp plugin doctor` 会降级成 warning 并报
   `No omp/pi manifest (not an omp plugin)`——**只警告不报错**，极易滑过去。
2. **枚举技能**时，因为根目录有合规 `plugin.json`，omp 把 `skills/` 交给更严格的 Agent Plugins
   校验器，而不是常规扫描器。严格校验器要求 frontmatter 字段集封闭（正是 Agent Skills 规范那六个键）
   且不认 omp 自有的 `hide` / `enabled`——本包 16 个技能全部通过，由 `scripts/check-package.mjs` 门禁保证。

### Claude Code

`.claude-plugin/plugin.json` 已声明完整技能清单。按 Claude Code 的插件目录机制放置本包即可被发现，
只依赖 `skills/` 目录本身，不需要构建步骤。

### MiniMax Code

运行用的副本由脚本镜像到 `~/.minimax/plugins/harness-engineering-skills`：

```bash
node scripts/update-upstream.mjs --install
```

不联网，只做镜像。改完包本体后重跑同一条命令即可；`--apply` 同步完上游也会自动镜像一次。
注意 MiniMax Code 会优先读根 `plugin.json`，`.minimax-plugin/` 里的图标配置因此可能不生效——
取舍说明见上面「关于 MiniMax Code 的图标取舍」。

### 装完怎么验

三条命令按可信度递增，**逐级验证，别跳过**：

```bash
# 1. 包自身是否完整、规范是否仍成立（离线，任何时候都可跑）
bash ./init.sh                     # Windows 上若 bash 不是 WSL 的，用 git-bash 跑；必须 exit 0

# 2. 客户端是否认领了插件
omp plugin doctor                  # 本包应为 4 ok / 0 warnings / 0 errors

# 3. 客户端是否真的枚举到了技能 ← 只有这条能证明「装上了」
omp skill list
```

第 3 条最重要：**`omp plugin doctor` 只证明插件被认领，不证明技能被枚举**。
`omp skill list` 列出客户端实际加载的全部技能，逐个比对名字才算数。

实测（omp 18.8.7，本机同时装有承接方与 superpowers）：`omp skill list --json` 共 **98** 条，
本包 16 个**全部在列、各出现一次**，整张表**没有任何一条带 `<namespace>/` 后缀、没有重复名**，
且 `warnings` 为空数组。其中 C 组那 5 个与已启用的 superpowers 副本逐字节相同，
被 omp 的「同名同体」静默去重规则合并，所以各只出现一次——**这是预期结果，不是丢技能**。

## 怎么用

代理装上本包后从入口技能进：

1. **不知道怎么用**：读 `skills/using-harness-engineering-skills/SKILL.md`，里面有任务维度的路由表。
2. **典型落地顺序**：先把项目自己的 `init.sh` 与 CI 当作验证入口，再按项目实际面启用
   对应能力技能——接口契约、安全加固、性能测量、发布与迁移，按需逐个接进来。
3. **要推进一个工单**：需求对齐 / 拆单由流程类技能主导，本包负责实现阶段的能力补强；
   **隔离与委派方式先问用户**。
   本入口与实现主流程是两条独立指令，主流程不会自动把它拉进来——**进工单时要把
   `using-harness-engineering-skills` 一并带上**，否则入口里那张阶段必查表在整条主路径上都不会被看见。

一句话边界：**本包不产出验证入口，也不认任何别的入口**——跑哪条命令由项目自己的门禁脚本与 CI 决定。

## 同步上游

```bash
node scripts/update-upstream.mjs --check     # 比对上游 HEAD 与本地锁定版本，不写任何文件
node scripts/update-upstream.mjs --apply     # 同步到上游目标 ref，并镜像到安装目录
node scripts/update-upstream.mjs --install   # 不联网，只重装到安装目录
```

参数：`--only <source>`（只处理一个上游）、`--ref <branch|tag|sha>`、`--install-dir <path>`、
`--force`（丢弃本地对 vendored 文件的改写）、`--keep-temp`（保留临时目录便于排查）。

行为约定：

- 按 commit 下载归档（`main` 只是解析入口），内容不可变；每个上游只解归档自己需要的那几块；
- `--apply` 是**两阶段**的：所有选中的上游都解析、下载、比对完，确认无漂移告警后才开始写文件。
  任何一步失败都在写盘之前中止，不会留下"文件已改、锁没更新"的半同步状态；
- 同步前做**漂移检测**：内容与锁定版本不一致才算本地改写（仅换行符差异不算），
  命中就中止并列出改动，确认要丢弃再加 `--force`；
- 上游删除的文件会清掉，新增的会带上；
- 锁文件按上游分条目（`sources.agent-skills` / `sources.superpowers`），各锁各的 commit，
  `--only` 不影响另一条的锁。

## 自检

```bash
./init.sh                                 # 门禁主入口，必须 exit 0 才能声明完成
node --check scripts/update-upstream.mjs  # 脚本语法
node --check scripts/check-ref-table.mjs
node scripts/check-ref-table.mjs          # 引用表对账（init.sh 已含）
node scripts/check-package.mjs            # 规范符合性、清单、归属与 vendored 字节（init.sh 已含）
node scripts/update-upstream.mjs --check  # 联网报告上游变化与漂移，不作为完成门禁
```

- `./init.sh` 离线运行两道门禁：共享清单引用表对账，以及包一致性检查。后者核对
  **根 `plugin.json` 对 Agent Plugins 1.0.0 §5 的符合性**（`$schema` 规范标识、封闭顶层字段集、
  `author` 子字段、`name` 的长度与字符集约束）、**每个 `skills/*/SKILL.md` 对 Agent Skills 规范的符合性**
  （frontmatter 封闭字段集、`name` 与目录名一致且合命名规则、`description` 1–1024 字符、
  `compatibility` ≤500 字符）、四份清单的包名与版本、两份显式技能清单与磁盘目录、
  锁定文件的字节数和 SHA-256，以及 `old-code` 完整登记为本地内容且其 Markdown 本地链接可达。
- PATH 上没有 `node` 时会按常见安装位置回退，也可用 `NODE=/path/to/node ./init.sh` 指定解释器。
- `--check` 会联网。它是**报告**，不是门禁；上游有新提交属于待同步信息，不应阻断本地交付。
- 门禁证明**包自身**符合规范，不证明**宿主真的加载了**它。后者要靠 `omp skill list` 之类的
  客户端侧枚举（见「装完怎么验」）。`old-code` 的行为用例在
  `skills/old-code/evals/evals.json`，效果对照还需独立执行与用户反馈。

## 许可

- **本包自写部分**（manifest、图标、脚本、入口技能、`old-code`、文档）：MIT，见根目录 `LICENSE` 第一节。
- **vendored 内容**：两个上游均为 MIT——Copyright (c) 2025 Addy Osmani、
  Copyright (c) 2025 Jesse Vincent。许可全文逐字节保留在 `licenses/agent-skills-LICENSE` 与
  `licenses/superpowers-LICENSE`，逐文件归属见 `upstream.lock.json` 的 `sources.<id>.managed`。

根目录 `LICENSE` 只覆盖自写部分，不代指上游许可全文。

## 注意

- `browser-testing-with-devtools` 依赖 **chrome-devtools MCP server**，本包不内置该 MCP。
- 入口技能对工作树隔离与并行委派采取"先商定再执行"的默认策略，不自动触发。
- 同步脚本的安装目录默认是 `~/.minimax/plugins/harness-engineering-skills`；
  该目录不能是包本体自身或其上下级目录，脚本会显式拒绝。
