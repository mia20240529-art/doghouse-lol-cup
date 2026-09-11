import { describe, expect, it, beforeEach, vi } from "vitest";
import config from "../src/data/config.json";
import rawQuestions from "../src/data/questions.json";
import {
  getValidQuestions,
  selectQuestions,
} from "../src/utils/questionSelector";
import {
  buildResult,
  isCorrect,
  scoreAnswer,
  titleFor,
  worstMistake,
} from "../src/utils/scoring";
import {
  clearResults,
  readPlayer,
  readResults,
  savePlayer,
  saveResult,
} from "../src/utils/storage";
import type { Question } from "../src/types/question";
// 仅为软件测试夹具，无 LOL 知识内容；不导入正式应用。
const q: Question = {
  id: "test_1",
  enabled: true,
  verified: true,
  category: "mechanics",
  difficulty: "hard",
  type: "single",
  patch: "",
  question: "【软件测试夹具】",
  options: ["测试值 A", "测试值 B", "测试值 C", "测试值 D"],
  answer: 0,
  explanation: "仅测试程序",
  source: "测试夹具",
};
describe("题库准入与抽题", () => {
  it("正式占位数据全部禁用、未审核", () => {
    expect(getValidQuestions(rawQuestions)).toEqual([]);
    expect(rawQuestions.every((q) => !q.enabled && !q.verified)).toBe(true);
  });
  it("过滤未审核、未启用、无效答案、重复 id", () => {
    expect(
      getValidQuestions([
        q,
        q,
        { ...q, id: "a", verified: false },
        { ...q, id: "b", enabled: false },
        { ...q, id: "c", answer: 99 },
        { ...q, id: "d", timeLimit: 0 },
        null,
      ]),
    ).toEqual([q]);
  });
  it("不足 30 题自动缩减，空题库返回空数组", () => {
    expect(selectQuestions([q])).toHaveLength(1);
    expect(selectQuestions([])).toEqual([]);
  });
  it("题库充足时达到 30 题、分类符合权重、没有重复且不修改源数组", () => {
    const pool = config.categoryGroups.flatMap((g) =>
      Array.from({ length: 40 }, (_, i) => ({
        ...q,
        id: `${g.categories[0]}_${i}`,
        category: g.categories[0],
      })),
    );
    const snapshot = JSON.stringify(pool);
    const selected = selectQuestions(pool);
    expect(selected).toHaveLength(30);
    expect(new Set(selected.map((q) => q.id)).size).toBe(30);
    expect(JSON.stringify(pool)).toBe(snapshot);
    for (const g of config.categoryGroups) {
      const count = selected.filter((q) =>
        g.categories.includes(q.category),
      ).length;
      expect(count).toBeGreaterThanOrEqual(Math.floor((30 * g.weight) / 100));
      expect(count).toBeLessThanOrEqual(Math.ceil((30 * g.weight) / 100));
    }
  });
  it("类别不足时从其余类别补齐", () => {
    expect(
      selectQuestions(
        Array.from({ length: 40 }, (_, i) => ({ ...q, id: `m${i}` })),
      ),
    ).toHaveLength(30);
  });
});
describe("判题与计分", () => {
  it("单选、判断、情景题按对应类型匹配", () => {
    expect(isCorrect(q, 0)).toBe(true);
    expect(isCorrect(q, false)).toBe(false);
    expect(isCorrect({ ...q, type: "boolean", answer: false }, false)).toBe(
      true,
    );
    expect(isCorrect({ ...q, type: "scenario" }, 0)).toBe(true);
  });
  it("多选无序，但漏选、多选、重复选均判错", () => {
    const multi: Question = { ...q, type: "multiple", answer: [0, 2] };
    expect(isCorrect(multi, [2, 0])).toBe(true);
    for (const selected of [[0], [0, 1, 2], [0, 0]])
      expect(isCorrect(multi, selected)).toBe(false);
  });
  it("时间奖励最高为基础分的 15%", () => {
    expect(scoreAnswer(q, 0, 0, 0).earned).toBe(115);
    expect(scoreAnswer(q, 0, 7.5, 0).timeBonus).toBe(8);
  });
  it("截止时间和超过截止时间提交均自动判错，并清零连胜", () => {
    for (const elapsed of [15, 16, 100]) {
      const a = scoreAnswer(q, 0, elapsed, 9);
      expect(a.correct).toBe(false);
      expect(a.earned).toBe(0);
      expect(a.combo).toBe(0);
      expect(a.selected).toBeNull();
      expect(a.elapsed).toBe(15);
    }
  });
  it("连胜奖励只在第 3、5 题发放，第 9 题起暴走", () => {
    expect(scoreAnswer(q, 0, 0, 2).earned).toBe(165);
    expect(scoreAnswer(q, 0, 0, 4).earned).toBe(215);
    expect(scoreAnswer(q, 0, 0, 5).comboBonus).toBe(0);
    expect(scoreAnswer(q, 0, 0, 7).multiplier).toBe(1);
    expect(scoreAnswer(q, 0, 0, 8).earned).toBe(138);
    expect(scoreAnswer(q, 1, 0, 9).combo).toBe(0);
  });
  it("显式题目分值、限时覆盖默认值", () => {
    const a = scoreAnswer({ ...q, score: 200, timeLimit: 30 }, 0, 15, 0);
    expect(a.earned).toBe(215);
    expect(a.elapsed).toBe(15);
  });
});
describe("赛后统计与称号", () => {
  it("汇总正确率、分类、平均时间与最离谱错误", () => {
    const answers = [
      scoreAnswer(q, 0, 3, 0),
      scoreAnswer(
        { ...q, id: "2", category: "vision", difficulty: "doghouse" },
        1,
        9,
        1,
      ),
    ];
    const r = buildResult("测试选手", answers, "test-result");
    expect(r.accuracy).toBe(50);
    expect(r.averageTime).toBe(6);
    expect(r.categoryStats.vision).toEqual({ correct: 0, total: 1 });
    expect(r.maxCombo).toBe(1);
    expect(worstMistake(answers)?.question.id).toBe("2");
  });
  it("所有区间边界含小数均有称号", () => {
    expect(titleFor(20)).toBe("建议回去打人机");
    expect(titleFor(20.01)).toBe("峡谷气氛组");
    expect(titleFor(35)).toBe("峡谷气氛组");
    expect(titleFor(35.01)).toBe("理论黄金");
    expect(titleFor(90.01)).toBe("你是不是偷偷开了 Wiki？");
    expect(titleFor(100)).toBe("建议接受拳头调查");
  });
});
describe("本地存储", () => {
  beforeEach(() => {
    const memory = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => memory.get(key) ?? null,
      setItem: (key: string, value: string) => memory.set(key, value),
      removeItem: (key: string) => memory.delete(key),
    });
  });
  it("保存昵称、去重结果、按分数排序、清空保留昵称", () => {
    savePlayer("马哥");
    const low = buildResult("马哥", [scoreAnswer(q, 1, 3, 0)], "low");
    const high = buildResult("马哥", [scoreAnswer(q, 0, 3, 0)], "high");
    expect(saveResult(low)).toBe(true);
    saveResult(high);
    saveResult(high);
    expect(readResults().map((r) => r.id)).toEqual(["high", "low"]);
    expect(clearResults()).toBe(true);
    expect(readResults()).toEqual([]);
    expect(readPlayer()).toBe("马哥");
  });
  it("损坏数据与存储拒绝不会导致崩溃", () => {
    localStorage.setItem("doghouse_results", "not json");
    expect(readResults()).toEqual([]);
    localStorage.setItem("doghouse_results", "[null,{}]");
    expect(readResults()).toEqual([]);
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw Error("denied");
      },
      setItem: () => {
        throw Error("quota");
      },
      removeItem: () => {
        throw Error("denied");
      },
    });
    expect(readResults()).toEqual([]);
    expect(savePlayer("测试")).toBe(false);
    expect(clearResults()).toBe(false);
  });
});
