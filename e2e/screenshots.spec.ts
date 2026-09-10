import { expect, test } from "@playwright/test";
import fs from "node:fs";

// Phase 1 screenshots: login, board view, lanes view, all in state `midstream`.
// Also fails on any console error, per the definition of done.
const dir = "screenshots";

test("login, board, lanes in midstream", async ({ page }) => {
  fs.mkdirSync(dir, { recursive: true });
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(e.message));

  await page.goto("/login");
  await expect(page.getByTestId("login-submit")).toHaveText(/Sign in as Owen/);
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${dir}/01-login.png`, fullPage: true });

  await page.getByTestId("login-submit").click();
  await expect(page).toHaveURL(/\/deal$/);
  await expect(page.getByTestId("board")).toBeVisible();
  await expect(page.getByTestId("clock-ic")).toContainText("9");
  await expect(page.getByTestId("clock-bid")).toContainText("12");
  await expect(page.getByTestId("strip-waiting")).toContainText("3");
  await expect(page.getByTestId("strip-blocked")).toContainText("2");
  await expect(page.getByTestId("primary-action")).toHaveText("Review 3 proposals");
  await expect(page.getByTestId("rail-stage-2")).toHaveAttribute("aria-current", "page");
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${dir}/02-board.png`, fullPage: false });

  await page.getByTestId("view-lanes").click();
  await expect(page.getByTestId("lanes")).toBeVisible();
  await expect(page.getByTestId("row-qoe-3")).toContainText("Databook v1 received");
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${dir}/03-lanes.png`, fullPage: false });

  // Dimmed stages never lead to a dead page.
  await page.getByTestId("rail-stage-4").click();
  await expect(page.getByText(/Portfolio Room is coming/)).toBeVisible();

  expect(errors, `console errors:\n${errors.join("\n")}`).toEqual([]);
});
