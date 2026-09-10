import { expect, test } from "@playwright/test";
import fs from "node:fs";

// Phase 2 walkthrough: beats 2 and 3 of docs/DEMO_SCRIPT.md, with screenshots.
const dir = "screenshots";

test("inbox, decisions, activity, note", async ({ page }) => {
  fs.mkdirSync(dir, { recursive: true });
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(e.message));

  await page.goto("/login");
  await page.getByTestId("login-submit").click();
  await expect(page).toHaveURL(/\/deal$/);

  // Board: five workstream lanes, pinned action bar.
  await expect(page.locator('[data-testid^="lane-"]')).toHaveCount(5);
  await expect(page.getByTestId("action-bar").getByTestId("primary-action")).toHaveText("Review 3 proposals");
  await page.getByTestId("primary-action").click();

  // Inbox: three proposals with the source quoted.
  await expect(page).toHaveURL(/\/deal\/inbox$/);
  await expect(page.locator('[data-testid^="proposal-prop-"]')).toHaveCount(3);
  await expect(page.getByTestId("proposal-prop-ev-01")).toContainText("Please find attached draft databook v1");
  await expect(page.getByTestId("quote-highlight")).toBeVisible();
  await expect(page.getByTestId("primary-action")).toHaveText("Approve: mark done");
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${dir}/04-inbox.png` });

  // Approve the databook.
  await page.getByTestId("primary-action").click();
  await expect(page.getByTestId("toast")).toContainText("Databook v1 received is now done");
  await expect(page.locator('[data-testid^="proposal-prop-"]')).toHaveCount(2);

  // Approve the contracts summary.
  await expect(page.getByTestId("proposal-prop-ev-02")).toHaveAttribute("aria-pressed", "true");
  await page.getByTestId("primary-action").click();

  // The thin one: Approve is not the primary. Ask for confirmation is.
  await expect(page.getByTestId("proposal-prop-ev-10")).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("primary-action")).toHaveText("Ask for confirmation");
  await expect(page.getByTestId("proposal-detail")).toContainText("Thin.");
  await page.getByTestId("primary-action").click();
  await expect(page.getByTestId("proposal-prop-ev-10")).toContainText("Question out");
  await expect(page.getByTestId("primary-action")).toHaveText("Draft tonight's note");

  // Board after: two cards moved, one has a question out.
  await page.getByTestId("rail-tab-deal").click();
  await expect(page.getByTestId("item-qoe-3")).toHaveAttribute("data-status", "done");
  await expect(page.getByTestId("item-legal-3")).toHaveAttribute("data-status", "done");
  await expect(page.getByTestId("item-legal-4")).toHaveAttribute("data-status", "questionOut");
  await expect(page.getByTestId("strip-waiting")).toContainText("0");
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${dir}/05-board-after.png` });

  // Activity: three entries with the user and time.
  await page.getByTestId("rail-tab-activity").click();
  await page.getByTestId("activity-filter-decisions").click();
  const rows = page.locator('[data-testid^="activity-act-"]');
  await expect(rows.first()).toContainText("Asked for confirmation");
  await expect(rows.first()).toContainText("Owen Carver");
  await expect(rows.nth(1)).toContainText('Approved "Material contracts summary"');
  await expect(rows.nth(2)).toContainText('Approved "Databook v1 received"');
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${dir}/06-activity.png` });

  // Tonight's note: drafted from the two approvals, editable, sent.
  await page.getByTestId("primary-action").click();
  await expect(page).toHaveURL(/\/deal\/note$/);
  await expect(page.getByTestId("note-editor")).toBeVisible({ timeout: 5000 });
  const draft = await page.getByTestId("note-editor").inputValue();
  expect(draft).toContain("QoE: Databook v1 received done");
  expect(draft).toContain("Legal: Material contracts summary done");
  expect(draft).toContain("asked for confirmation");
  expect(draft).toContain("Open with the seller, past due");
  expect(draft).not.toContain("—");
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${dir}/07-note-draft.png` });

  await page.getByTestId("note-editor").fill(draft.replace("Team,", "Team,\n\nShort one tonight."));
  await page.getByTestId("primary-action").click();
  await expect(page.getByTestId("note-sent-chip")).toBeVisible();
  await expect(page.getByTestId("note-body")).toContainText("Short one tonight.");

  // Presenter menu: Shift+P, simulate the lender conflict arriving.
  await page.keyboard.press("Shift+P");
  await expect(page.getByTestId("presenter-menu")).toBeVisible();
  await page.getByTestId("presenter-simulate").click();
  await expect(page).toHaveURL(/\/deal\/inbox$/);
  await expect(page.getByTestId("proposal-prop-ev-11")).toBeVisible({ timeout: 5000 });
  await expect(page.getByTestId("conflict-claims")).toBeVisible();
  await expect(page.getByTestId("primary-action")).toHaveText("Ask the sender which is right");

  // Jump to kickoff and set up the sprint.
  await page.keyboard.press("Shift+P");
  await page.getByTestId("presenter-state-kickoff").click();
  await expect(page).toHaveURL(/\/deal$/);
  await expect(page.getByTestId("kickoff-card")).toBeVisible();
  await expect(page.getByTestId("primary-action")).toHaveText("Set up the sprint");
  await page.getByTestId("primary-action").click();
  await expect(page.getByTestId("kickoff-card")).toHaveCount(0);
  await expect(page.getByTestId("item-qoe-1")).toBeVisible();

  // Back to midstream for the next run.
  await page.keyboard.press("Shift+P");
  await page.getByTestId("presenter-state-midstream").click();
  await expect(page.getByTestId("strip-waiting")).toContainText("3");

  expect(errors, `console errors:\n${errors.join("\n")}`).toEqual([]);
});
