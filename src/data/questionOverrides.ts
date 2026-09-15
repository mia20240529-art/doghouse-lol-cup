import type { Question } from "../types/question";

type QuestionOverride = {
  replaceId: string;
  question: Question;
};

export const questionOverrides: QuestionOverride[] = [
  {
    replaceId: "esports_003",
    question: {
      id: "esports_003",
      enabled: true,
      category: "career_stats",
      difficulty: "insane",
      type: "single",
      patch: "统计截至2025 Worlds",
      question: "截至2025全球总决赛结束，下列哪组三名选手的世界赛参赛次数都达到8次？",
      options: [
        "Ruler / Xiaohu / Deft",
        "Ruler / Meiko / Deft",
        "Caps / Meiko / CoreJJ",
        "Xiaohu / Canyon / Deft"
      ],
      answer: 0,
      score: 200,
      timeLimit: 30,
      explanation: "截至2025 Worlds，Faker为10次、Maple为9次；Ruler、Xiaohu、Deft、Caps、CoreJJ均达到8次。原题把Meiko错误计入8次名单，现已修正。",
      source: "https://liquipedia.net/leagueoflegends/World_Championships/Player_appearances",
      verified: true
    }
  },
  {
    replaceId: "esports_055",
    question: {
      id: "esports_055",
      enabled: true,
      category: "worlds_history",
      difficulty: "insane",
      type: "multiple",
      patch: "统计截至2025 Worlds",
      question: "从2018到2025的八届全球总决赛中，哪些年份的决赛双方来自同一赛区？（多选）",
      options: ["2020", "2022", "2024", "2025"],
      answer: [1, 3],
      score: 200,
      timeLimit: 30,
      explanation: "2022决赛为DRX vs T1，2025决赛为T1 vs KT，均为LCK内战。原题只把2025设为正确答案，遗漏了2022。",
      source: "https://liquipedia.net/leagueoflegends/Worlds",
      verified: true
    }
  },
  {
    replaceId: "mech_071",
    question: {
      id: "mech_071",
      enabled: true,
      category: "champion_mechanics",
      difficulty: "hell",
      type: "single",
      patch: "历史/稳定机制",
      question: "卑尔维斯（Bel'Veth）获得强化真形态最典型需要与什么交互？",
      options: ["吃掉史诗级虚空目标掉落的Coral", "击杀10个英雄", "购买特定装备", "连续不回城10分钟"],
      answer: 0,
      score: 150,
      timeLimit: 20,
      explanation: "卑尔维斯消耗虚空珊瑚进入真形态；来自男爵、峡谷先锋等虚空史诗目标的强化虚空珊瑚会强化真形态，并允许召唤虚空鱼群。",
      source: "https://www.leagueoflegends.com/en-us/champions/belveth/",
      verified: true
    }
  },
  {
    replaceId: "patch_007",
    question: {
      id: "esports_056",
      enabled: true,
      category: "worlds_history",
      difficulty: "insane",
      type: "single",
      patch: "历史：2016 Worlds",
      question: "2016全球总决赛半决赛 ROX Tigers vs SKT，GorillA首次拿出辅助厄运小姐（Miss Fortune）是在第几局？",
      options: ["第一局", "第二局", "第三局", "第四局"],
      answer: 1,
      score: 200,
      timeLimit: 30,
      explanation: "GorillA在Game 2首次亮出辅助Miss Fortune，并在Game 3再次使用；SKT之后选择禁用。",
      source: "https://www.forbes.com/sites/mattperez/2016/10/21/sk-telecom-t1-vs-rox-tigers-recapping-the-first-semifinals-match-of-the-league-of-legends-world-championships-2016/",
      verified: true
    }
  },
  {
    replaceId: "doghouse_001",
    question: {
      id: "esports_057",
      enabled: true,
      category: "worlds_history",
      difficulty: "insane",
      type: "single",
      patch: "2025 Worlds",
      question: "2025全球总决赛淘汰赛采用Fearless Draft时，同一支队伍在一个BO5系列赛中，对已经使用过的英雄如何处理？",
      options: ["下一局仍可继续使用", "同一系列赛中不能再次使用", "只限制前三局", "只限制获胜方使用过的英雄"],
      answer: 1,
      score: 200,
      timeLimit: 30,
      explanation: "2025 Worlds淘汰赛采用Fearless Draft：同一系列赛内，英雄一旦被该队使用过，之后的局不能再次使用。",
      source: "https://liquipedia.net/leagueoflegends/World_Championship/2025/Knockout_Stage",
      verified: true
    }
  }
];

export function applyQuestionOverrides(data: unknown) {
  if (!data || typeof data !== "object") return data;
  const source = data as { questions?: unknown[] };
  if (!Array.isArray(source.questions)) return data;
  const replacements = new Map(questionOverrides.map((item) => [item.replaceId, item.question]));
  return {
    ...source,
    questions: source.questions.map((item) => {
      if (!item || typeof item !== "object") return item;
      const id = (item as { id?: unknown }).id;
      return typeof id === "string" && replacements.has(id) ? replacements.get(id)! : item;
    })
  };
}
