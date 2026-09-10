import { describe, expect, it } from "vitest";
import { addDays, daysBetween, dealClock, isDueThisWeek, isOverdue } from "./clock";
import demoStates from "@/data/demo-states.json";

describe("clock", () => {
  it("adds days across a month end", () => {
    expect(addDays("2026-08-21", 30)).toBe("2026-09-20");
    expect(addDays("2026-08-21", 33)).toBe("2026-09-23");
  });
  it("counts days between", () => {
    expect(daysBetween("2026-09-11", "2026-09-20")).toBe(9);
    expect(daysBetween("2026-09-20", "2026-09-11")).toBe(-9);
  });
  it("reads 9 and 12 in midstream from the saved today, not the wall clock", () => {
    const s = demoStates.states.midstream;
    const c = dealClock(s);
    expect(c.daysToIc).toBe(9);
    expect(c.daysToBid).toBe(12);
    expect(c.dayIndex).toBe(21);
  });
  it("due this week and overdue", () => {
    expect(isDueThisWeek("2026-09-18", "2026-09-11")).toBe(true);
    expect(isDueThisWeek("2026-09-19", "2026-09-11")).toBe(false);
    expect(isOverdue("2026-09-10", "2026-09-11")).toBe(true);
  });
});
