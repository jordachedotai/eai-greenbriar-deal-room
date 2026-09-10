import { expect, test } from "@playwright/test";
import fs from "node:fs";

// The four beats of docs/DEMO_SCRIPT.md, end to end, in mock mode, with no console errors.
// Screenshots: readiness in midstream after beat 2, and readiness in ic-minus-3.
const dir = "screenshots";

test("four beats: before, evidence lands, the note, readiness", async ({ page }) => {
  fs.mkdirSync(dir, { recursive: true });
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(e.message));

  // Presenter opens in state midstream signed in as the VP.
  await page.goto("/login");
  await page.getByTestId("login-person-vp").click();
  await page.getByTestId("login-submit").click();
  await expect(page).toHaveURL(/\/deal$/);

  // Beat 1, before. Lanes view: the tracker with empty cells for tonight. Then the board and the clock.
  await page.getByTestId("view-lanes").click();
  await expect(page.getByTestId("lanes")).toBeVisible();
  await expect(page.getByTestId("row-qoe-3").locator("td.empty-cell")).toHaveCount(1);
  await page.getByTestId("view-board").click();
  await expect(page.locator('[data-testid^="lane-"]')).toHaveCount(5);
  await expect(page.getByTestId("lane-financing")).toContainText("Cobalt Ridge Capital, Larkspur Credit Partners");
  await expect(page.getByTestId("clock-ic")).toContainText("9");
  await expect(page.getByTestId("clock-bid")).toContainText("12");

  // Beat 2, evidence lands. Three proposals. Approve two, ask on the thin one.
  await page.getByTestId("primary-action").click();
  await expect(page.locator('[data-testid^="proposal-prop-"]')).toHaveCount(3);
  await expect(page.getByTestId("quote-highlight")).toBeVisible();
  await page.getByTestId("primary-action").click(); // Approve the databook
  await page.getByTestId("primary-action").click(); // Approve the contracts summary
  await expect(page.getByTestId("primary-action")).toHaveText("Ask for confirmation");
  await page.getByTestId("primary-action").click();
  await page.getByTestId("rail-tab-deal").click();
  await expect(page.getByTestId("item-qoe-3")).toHaveAttribute("data-status", "done");
  await expect(page.getByTestId("item-legal-3")).toHaveAttribute("data-status", "done");
  await expect(page.getByTestId("item-legal-4")).toHaveAttribute("data-status", "questionOut");
  await page.getByTestId("rail-tab-activity").click();
  await page.getByTestId("activity-filter-decisions").click();
  await expect(page.locator('[data-testid^="activity-act-"]').first()).toContainText("Owen Carver");
  // Toasts do not follow across screens.
  await expect(page.getByTestId("toast")).toHaveCount(0);

  // Beat 3, the note. Drafted from the two approvals. Edit one line. Send.
  await page.getByTestId("primary-action").click();
  await expect(page.getByTestId("note-editor")).toBeVisible({ timeout: 5000 });
  const draft = await page.getByTestId("note-editor").inputValue();
  expect(draft).toContain("QoE: Databook v1 received done");
  expect(draft).toContain("\n\nLegal: ");
  expect(draft).toContain("\n\nHR: ");
  await page.getByTestId("note-editor").fill(draft.replace("Financing: No change today.", "Financing: Lender sessions with the CFO set for Monday."));
  await page.getByTestId("primary-action").click();
  await expect(page.getByTestId("note-sent-chip")).toBeVisible();

  // Beat 4, readiness. Two sections unsupported, eight questions with three overdue, checklist.
  await page.getByTestId("rail-tab-readiness").click();
  await expect(page.getByTestId("ready-unsupported")).toContainText("2");
  await expect(page.locator('[data-testid^="coverage-memo-"]')).toHaveCount(10);
  await expect(page.locator('[data-coverage="none"]')).toHaveCount(2);
  await expect(page.getByTestId("owed-memo-industry")).toContainText("owed by IT");
  await expect(page.getByTestId("owed-memo-levers")).toContainText("owed by IT and HR");
  await expect(page.locator('[data-testid^="question-sq-"]')).toHaveCount(8);
  await expect(page.locator('[data-testid^="question-sq-"][data-overdue="true"]')).toHaveCount(3);
  await expect(page.getByTestId("bid-count")).toHaveText("1 of 6 done");
  await expect(page.getByTestId("bid-checklist")).toContainText("Offer letter draft");
  // One mark per supporting lane, blank elsewhere. Industry Overview is supported by IT only.
  await expect(page.getByTestId("coverage-memo-industry").locator('[data-mark="inProgress"]')).toHaveCount(1);
  await expect(page.getByTestId("coverage-memo-industry").locator('[data-mark="blank"]')).toHaveCount(4);
  // The percent lives in the column header only. Cells carry a mark, no visible text.
  await expect(page.getByTestId("coverage-memo-company").locator("td").nth(1)).toHaveText("", { useInnerText: true });
  await expect(page.getByTestId("primary-action")).toHaveText("Back to the board");
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${dir}/08-readiness-midstream.png` });

  // Ticking a bid item is logged.
  await page.getByTestId("bid-bid-4").check();
  await expect(page.getByTestId("bid-count")).toHaveText("2 of 6 done");

  // The loop rail: five stages, Deal Room active, the rest dimmed but never dead.
  for (const n of [1, 3, 4, 5]) await expect(page.getByTestId(`rail-stage-${n}`)).toBeVisible();
  await expect(page.getByTestId("rail-stage-2")).toHaveAttribute("aria-current", "page");
  await page.getByTestId("rail-stage-3").click();
  await expect(page.getByText(/Close is coming/)).toBeVisible();

  // Presenter: ic-minus-3 readiness.
  await page.keyboard.press("Shift+P");
  await page.getByTestId("presenter-state-ic-minus-3").click();
  await expect(page).toHaveURL(/\/deal$/);
  await expect(page.getByTestId("clock-ic")).toContainText("3");
  await page.getByTestId("rail-tab-readiness").click();
  await expect(page.getByTestId("ready-unsupported")).toContainText("2");
  await expect(page.locator('[data-testid^="question-sq-"][data-overdue="true"]')).toHaveCount(3);
  await expect(page.getByTestId("bid-count")).toHaveText("3 of 6 done");
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${dir}/09-readiness-ic-minus-3.png` });

  // Kickoff reads every section unsupported.
  await page.keyboard.press("Shift+P");
  await page.getByTestId("presenter-state-kickoff").click();
  await page.getByTestId("rail-tab-readiness").click();
  await expect(page.locator('[data-coverage="none"]')).toHaveCount(10);
  await expect(page.locator('[data-mark="notStarted"]').first()).toBeVisible();
  await expect(page.locator('[data-mark="inProgress"]')).toHaveCount(0);

  // Leave the browser in midstream.
  await page.keyboard.press("Shift+P");
  await page.getByTestId("presenter-state-midstream").click();

  expect(errors, `console errors:\n${errors.join("\n")}`).toEqual([]);
});
