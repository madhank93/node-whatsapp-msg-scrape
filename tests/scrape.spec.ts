import { test, chromium, expect, Route } from "@playwright/test";
import conf from "./config.json";
import fs from "fs";
import path from "path";

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
  page.waitForLoadState("domcontentloaded");
  page.waitForLoadState("networkidle");
  await page
    .locator("//span[@data-icon='alert-notification']")
    .waitFor({ state: "visible" });

  const groups = conf.whatsapp_groups;

  const parsedMessagesWithGroups = new Map<String, String[]>();

  for (let grpCount = 0; grpCount < groups.length; grpCount++) {
    page.waitForLoadState("domcontentloaded");
    page.waitForLoadState("networkidle");
    await page.locator("//div[@id='pane-side']").focus();
    await page.getByText(groups[grpCount], { exact: true }).click();
    // page.waitForLoadState("domcontentloaded");

    if (
      await page.locator("//div[@aria-label='Scroll to bottom']").isVisible()
    ) {
      await page.locator("//div[@aria-label='Scroll to bottom']").click();
    }

    const parsedMessages: string[] = [];

    while (true) {
      page.waitForLoadState("domcontentloaded");
      page.waitForLoadState("networkidle");
      await page.locator("//div[@data-tab='8']").focus();
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

  const date = new Date();
  const formattedTime = date
    .toLocaleTimeString("en-US", {
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: true,
    })
    .replace(/ /g, "-");

  for (let [key, value] of parsedMessagesWithGroups) {
    fs.writeFileSync(
      `${process.cwd()}/parsed_${formattedTime}.txt`,
      `@@@@@@@@@@=${key}=@@@@@@@@@@ \n`,
      {
        flag: "a",
      }
    );
    value.forEach((msg) => {
      fs.writeFileSync(
        `${process.cwd()}/parsed_${formattedTime}.txt`,
        `${msg} \n`,
        { flag: "a" }
      );
      fs.writeFileSync(
        `${process.cwd()}/parsed_${formattedTime}.txt`,
        `${"#########".repeat(10)}`,
        { flag: "a" }
      );
    });
    fs.writeFileSync(
      `${process.cwd()}/parsed_${formattedTime}.txt`,
      `\n ${"===*===".repeat(6)} \n`,
      {
        flag: "a",
      }
    );
  }
});
