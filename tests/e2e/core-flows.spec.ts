import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

async function signInAsDemoUser(page: Page, user: "anna" | "bas" = "anna") {
  await page.goto("/signin");
  await page.getByRole("button", { name: user === "anna" ? "Open als Anna" : "Open als Bas" }).click();
  await expect(page).toHaveURL(/\/home$/);
}

test("core mobile flow", async ({ page }) => {
  const listName = `Playwright lijst ${Date.now()}`;

  await signInAsDemoUser(page, "anna");

  await page.goto("/lists");
  await page.getByText("Lijst maken").first().click();
  await page.getByPlaceholder("Weekend in Rotterdam").fill(listName);
  await page.getByRole("button", { name: "Lijst maken" }).last().click();

  await page.getByRole("link", { name: new RegExp(listName, "i") }).click();

  await page.getByText("Plek toevoegen").first().click();
  await page.getByPlaceholder("Markthal").fill("Nieuwe koffiestop");
  await page.getByPlaceholder("Straat en huisnummer").fill("Stationsplein 1");
  await page.getByRole("button", { name: "Plek opslaan" }).click();

  await expect(page.getByTestId("filtered-places").getByText("Nieuwe koffiestop")).toBeVisible();

  await page.getByRole("button", { name: "Plan vandaag" }).last().click();
  await expect(page).toHaveURL(/\/today\?listId=/);
  await page.getByRole("button", { name: "Route maken" }).click();
  await expect(page).toHaveURL(/\/route\//);
  await expect(page.getByRole("button", { name: "Open in Google Maps" })).toBeVisible();

  await page.getByRole("button", { name: "Markeer huidige stop bezocht" }).click();
  await page.goto("/history");
  await expect(page.getByText("Plek bezocht").first()).toBeVisible();
});
