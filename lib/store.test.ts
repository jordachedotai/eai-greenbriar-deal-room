// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";

describe("store migration", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
    localStorage.clear();
  });

  it("logs old and new STORE_VERSION once, then starts clean", async () => {
    localStorage.setItem(
      "greenbriar-deal-room",
      JSON.stringify({ state: { currentUserId: "p-vp", view: "lanes", stateName: "kickoff", state: { items: [] } }, version: 1 }),
    );
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { useStore, STORE_VERSION } = await import("./store");
    await new Promise((r) => setTimeout(r, 0));
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]![0]).toContain("version 1");
    expect(warn.mock.calls[0]![0]).toContain(`version ${STORE_VERSION}`);
    const s = useStore.getState();
    expect(s.currentUserId).toBeNull();
    expect(s.stateName).toBe("midstream");
    expect(s.state.items.length).toBe(37);
  });
});
