import { test, chromium, expect, Route } from "@playwright/test";
import conf from "./config.json";
import fs from "fs";

test.beforeEach(async ({ context }) => {
  await context.route(/(png|jpeg)$/, (route) => route.abort());
  await context.route("https://linktr.ee/peekayresearchers", (route) =>
    route.abort()
  );
});

test("Whatsapp scrape", async () => {
  const browser = await chromium.launchPersistentContext(
    `C:\\Users\\maddy\\AppData\\Local\\Google\\Chrome\\User Data\\Default`,
    { headless: false }
  );
  const page = await browser.newPage();
  await page.goto("https://web.whatsapp.com/");
  await page
    .locator("//span[@data-icon='alert-notification']")
    .waitFor({ state: "visible", timeout: 30000 });

  const groups = conf.whatsapp_groups;

  const parsedMessagesWithGroups = new Map<String, String[]>();

  for (let grpCount = 0; grpCount < groups.length; grpCount++) {
    await page.getByText(groups[grpCount], { exact: true }).click();
    const chatBox = page.locator("//div[@data-tab='8']");
    chatBox.focus();
    page.waitForLoadState("domcontentloaded");

    if (
      await page.locator("//div[@aria-label='Scroll to bottom']").isVisible()
    ) {
      await page.locator("//div[@aria-label='Scroll to bottom']").click();
    }

    const parsedMessages: string[] = [];

    while (true) {
      page.waitForLoadState("domcontentloaded");
      page.waitForLoadState("networkidle");

      await page.keyboard.press("ArrowUp");
      const focusedElementText = await page.evaluate(
        () => document.activeElement!.textContent
      );
      if (focusedElementText === "TODAY") {
        break;
      }
      parsedMessages.push(focusedElementText!);
    }
    parsedMessagesWithGroups.set(groups[grpCount], parsedMessages);
  }

  for (let [key, value] of parsedMessagesWithGroups) {
    fs.writeFileSync("parsed.txt", `@@@@@@@@@@=${key}=@@@@@@@@@@ \n`, {
      flag: "a",
    });
    value.forEach((msg) => {
      fs.writeFileSync("parsed.txt", `${msg}`, { flag: "a" });
    });
    fs.writeFileSync("parsed.txt", `\n ${"===*===".repeat(6)} \n`, {
      flag: "a",
    });
  }
});
