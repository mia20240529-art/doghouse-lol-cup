# 🐶 狗窝杯 LOL 知识问答大赛

**请证明你不是云玩家。** 朋友内部娱乐用的 League of Legends 高难度知识问答网页游戏，手机优先、兼容桌面。React + Vite + TypeScript + 普通 CSS，纯静态，无后端、无登录、无实时多人联机。

## 当前题库状态

没有提供经过审核的正式题目。`src/data/questions.json` 只有 **4 个禁用、未审核的结构占位模板**，不含 AI 编写的 LOL 题目或事实答案。首页和报名页显示「狗窝委员会还没有审核题目。」，禁止空题库开赛。

只有同时满足 `enabled === true`、`verified === true` 且通过结构校验的题目才能进入考试。系统只验证数据结构，不核实、生成或自动修正 LOL 答案。占位模板不能直接启用，必须由人工提供真实题目、答案、解析与来源后审核。

## 安装与运行

建议使用 Node.js 22.12+（CI 使用 Node.js 22）。

```bash
npm install
npm run dev
```

打开终端提示的 `http://127.0.0.1:5173/doghouse-lol-cup/`。

```bash
npm run typecheck
npm test
npm run build
npm run preview
```

`dist/` 是可发布静态站点。`tests/ui.html` 是仅本地 Vite 开发服务器使用的界面测试入口，可访问 `/doghouse-lol-cup/tests/ui.html`；测试夹具不含 LOL 知识、不导入正式应用，也不在 `dist/` 中发布。

## GitHub Pages 部署

1. 将项目推送到 GitHub 仓库 `doghouse-lol-cup` 的 `main` 分支。
2. 仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。
3. `.github/workflows/deploy.yml` 在每次 push 到 main 后自动安装锁定依赖（`npm ci`）、检查 TypeScript、运行测试、构建并部署。也可在 Actions 中手动运行。
4. 部署完成后访问 `https://用户名.github.io/doghouse-lol-cup/`。

当前账号的目标地址：`https://mia20240529-art.github.io/doghouse-lol-cup/`。

`vite.config.ts` 已设置 `base: '/doghouse-lol-cup/'`。页面采用应用内状态切换，不依赖服务器路径重写；静态资源兼容项目子路径。更换仓库名称时同步修改 base。部署本项目不需要配置令牌 secret，Actions 使用 GitHub 自带的权限和 OIDC。

参考：[Vite 官方部署文档](https://vite.dev/guide/static-deploy#github-pages)、[GitHub Pages 工作流文档](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。

## 页面与功能

- 首页：赛事入口、题库状态、比赛规则、历史成绩。
- 报名：只输入昵称；已保存昵称自动回填。
- 答题：类别与难度、可选版本、倒计时、即时反馈、正确答案与解析来源。
- 计分：基础分、最高 15% 时间奖励、连胜奖励与狗窝暴走。
- 赛后：总分、答对/总题数、正确率、最长 Combo、平均答题时间、分类正确率、称号、最高难度错题。
- 历史：按分数降序；点击查看完整成绩；二次确认清空。

## 新增题目与字段

编辑 `src/data/questions.json`，保持 JSON 数组结构。复制对应题型的占位模板，填写真实数据；人工确认答案与来源后才将两个状态设为 `true`。索引从 **0** 开始，`answer: 2` 表示第三个选项。

| 字段        | 类型                        | 说明                                                 |
| ----------- | --------------------------- | ---------------------------------------------------- |
| id          | string                      | 非空且全库唯一；重复 id 只保留第一个有效题           |
| enabled     | boolean                     | 是否启用，必须严格为 true                            |
| verified    | boolean                     | 是否人工审核，必须严格为 true                        |
| category    | string                      | 分类编码；推荐使用下表，其他编码可显示并参与补位     |
| difficulty  | string                      | hard / hell / insane / doghouse                      |
| type        | string                      | single / multiple / boolean / scenario               |
| patch       | string                      | 规则版本；空字符串不显示版本标签                     |
| question    | string                      | 题干；支持换行                                       |
| options     | string[]                    | 单选、情景题通常 4 项；多选至少 2 项；判断题可省略   |
| answer      | number / number[] / boolean | 单选、情景用索引；多选用无重复索引数组；判断用布尔值 |
| score       | number，可省略              | 正数，覆盖难度基础分；不填使用默认值                 |
| timeLimit   | number，可省略              | 正数，单位秒；不填使用默认值                         |
| explanation | string                      | 人工提供的详细解析                                   |
| source      | string                      | 来源说明或 http/https 链接                           |

情景机制题 V1 按单选交互与判分。多选必须完全匹配，不分顺序；漏选、多选均判错。布尔 `true` 为「正确」，`false` 为「错误」。无效题目跳过，绝不自动修正内容。

### 分类与抽题

分类标签、抽题权重在 `src/data/config.json`。先筛选、按 id 去重并 Fisher–Yates 洗牌，再按分类组分配目标题数，余数按比例分配，同余随机打散。类别不足时，从其他剩余题随机补足，最后再次洗牌。有效题不足设定题数时全部抽取，零题显示审核提示。

| 分类组                | category 编码            | 目标比例 |
| --------------------- | ------------------------ | -------- |
| 英雄机制              | mechanics                | 20%      |
| 技能交互 / 英雄技能   | interactions / abilities | 20%      |
| 地图 / 视野           | map / vision             | 15%      |
| 装备理解              | items                    | 15%      |
| 版本考古              | history                  | 10%      |
| 峡谷机制 / 召唤师技能 | rift / summoner          | 10%      |
| 职业赛事              | esports                  | 5%       |
| 狗窝题 / 冷知识       | doghouse / trivia        | 5%       |

结果展示各细分类；未抽到的分类标记「本局未抽到」，不伪装成 0% 正确率。

## 分数、时间和连胜规则

| 难度              | 基础分 | 默认时间 |
| ----------------- | ------ | -------- |
| 困难 hard         | 100    | 15 秒    |
| 地狱 hell         | 150    | 20 秒    |
| 逆天 insane       | 200    | 30 秒    |
| 狗窝绝密 doghouse | 300    | 20 秒    |

时间奖励 = `round(剩余时间 / 限时 × 基础分 × 0.15)`。连胜第 3 题加 50、第 5 题加 100；每段连胜只在对应里程碑奖励一次。第 8 题激活暴走，**第 9 题起**：`round((基础分 + 时间奖励) × 1.2)`。答错或超时本题 0 分、Combo 清零。

计时基于题目进入时记录的实际截止时间，切后台仍消耗时间；提交时重新检查截止时间，过期提交自动判错。提交后立即锁定、停止计时，反馈页面没有倒计时。平均时间按每题实际作答耗时计算，超时题计满额限时，不包含阅读解析的时间。

最离谱错误选本局最高难度错题，同难度保留最早一题；没有服务端全体统计，因此不使用整体正确率。全对时单独显示无错题状态。

## 语录、称号与每局题数

- **语录**：编辑 `src/data/quotes.json`，往 `correct`、`wrong`、`combo`、`finish` 数组加入文本；支持马哥经典语录和内部梗。所有随机评价都从 JSON 加载。
- **称号**：编辑 `src/data/titles.json`，按 `maxAccuracy` 从小到大排列。正确率不先取整，采用 `≤20、≤35、≤50、≤65、≤80、≤90、<100、100` 连续区间，避免小数正确率落空。显示正确率四舍五入至一位小数，称号依据原始值。
- **每局题数**：修改 `src/data/config.json` 的 `questionCount`（正整数）。首页、规则页和抽题统一读取此配置。
- **难度默认分值 / 时间**：修改同一文件的 `difficulties`。

## 本地数据

使用 `doghouse_player` 保存昵称，`doghouse_results` 保存成绩。`doghouse_settings` 作为未来设置键保留，V1 没有需要保存的设置项。

每条结果包含 `nickname`、`timestamp`、`score`、`correct`、`total`、`accuracy`、`maxCombo`、`categoryStats`，并追加唯一 id、平均时间、完整作答快照及本局语录，历史结果不会受未来题库修改影响。完成一局才保存，同一 id 防重复写入。损坏数据跳过，存储不可用时仍可答题和看结果，并显示保存失败提示。

成绩只属于当前设备与浏览器。清除浏览器数据或换设备后无法恢复；没有云端榜单。刷新 / 退出会放弃未完成局。纯前端的题库答案和本地分数可被查看或修改，V1 适合朋友娱乐，依靠自觉，不具备强制防作弊能力。

## 项目结构

```text
doghouse-lol-cup/
├─ .github/workflows/deploy.yml
├─ public/favicon.svg
├─ src/
│  ├─ components/
│  │  ├─ AnswerOption.tsx
│  │  ├─ CategoryStats.tsx
│  │  ├─ ComboBadge.tsx
│  │  ├─ QuestionCard.tsx
│  │  ├─ QuoteBox.tsx
│  │  ├─ ResultCard.tsx
│  │  ├─ ScoreBar.tsx
│  │  └─ Timer.tsx
│  ├─ data/{questions,quotes,titles,config}.json
│  ├─ pages/{Home,PlayerSetup,Rules,Quiz,Result,History}.tsx
│  ├─ types/{question,result}.ts
│  ├─ utils/{questionSelector,scoring,storage}.ts
│  ├─ App.tsx
│  ├─ main.tsx
│  └─ styles.css
├─ tests/{core.test.ts,ui.html,ui.tsx}
├─ index.html
├─ package.json
├─ package-lock.json
├─ tsconfig.json
├─ vite.config.ts
└─ README.md
```

本项目不是 Riot Games 官方产品，也不代表其观点。LOL 与 League of Legends 相关名称属于其权利人。
