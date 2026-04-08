import { chromium, devices } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

async function main() {
  const baseUrl = process.env.BASE_URL ?? "http://localhost:3001";
  const outputDir = process.env.OUTPUT_DIR ?? "/tmp";
  const iphone = devices["iPhone 14"];

  await fs.mkdir(outputDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    ...iphone,
    locale: "nl-NL",
    timezoneId: "Europe/Amsterdam"
  });
  const page = await context.newPage();

  await page.goto(`${baseUrl}/api/dev/demo-login?user=anna&redirectTo=/home`, {
    waitUntil: "networkidle"
  });

  const shots = [
    { name: "samenroute-shot-home.png", url: "/home" },
    { name: "samenroute-shot-lists.png", url: "/lists" },
    { name: "samenroute-shot-list-detail.png", url: "/lists/20000000-0000-4000-8000-000000000001" },
    { name: "samenroute-shot-today.png", url: "/today?listId=20000000-0000-4000-8000-000000000001" },
    { name: "samenroute-shot-route-session.png", url: "/route/70000000-0000-4000-8000-000000000001" }
  ] as const;

  for (const shot of shots) {
    await page.goto(`${baseUrl}${shot.url}`, { waitUntil: "networkidle" });
    await page.screenshot({
      path: path.join(outputDir, shot.name),
      fullPage: true
    });
  }

  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
