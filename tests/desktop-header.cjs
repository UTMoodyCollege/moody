// NODE_PATH=<existing Playwright install> node tests/desktop-header.cjs <url>
const assert = require('node:assert/strict');
const { chromium } = require('@playwright/test');
const path = require('node:path');
(async () => {
  const browser = await chromium.launch({headless: true});
  try {
    const page = await browser.newPage({ignoreHTTPSErrors: true});
    await page.goto(process.argv[2]);
    await page.addStyleTag({path: path.join(__dirname, '../css/styles.css')});
    for (const width of [1200, 1280, 1366, 1440, 1600, 1920]) {
      await page.setViewportSize({width, height: 1000});
      await page.waitForTimeout(200);
      const boxes = await page.locator('#moody-header').evaluate(header => {
        const logo = header.querySelector('.ut-logo--main').getBoundingClientRect();
        const search = header.querySelector('.ut-search-form').getBoundingClientRect();
        const submit = header.querySelector('.ut-search-form .form-submit').getBoundingClientRect();
        return {logoRight: logo.right, logoWidth: logo.width, logoHeight: logo.height, searchLeft: search.left, searchWidth: search.width,
          submitFits: submit.left >= search.left && submit.right <= search.right + 1,
          overflow: document.documentElement.scrollWidth > innerWidth};
      });
      assert(boxes.logoRight + 15 <= boxes.searchLeft, JSON.stringify({width, boxes}));
      assert(boxes.logoWidth >= 300 && boxes.logoHeight >= 30, `Logo collapsed: ${JSON.stringify({width, boxes})}`);
      assert(boxes.searchWidth >= 150 && !boxes.overflow, JSON.stringify({width, boxes}));
      assert(boxes.submitFits, `Search button escaped form: ${JSON.stringify({width, boxes})}`);
    }
    if (process.env.SCREENSHOT) await page.screenshot({path: process.env.SCREENSHOT});
    for (const width of [320, 375, 768, 1199]) {
      await page.setViewportSize({width, height: 900});
      await page.waitForTimeout(300);
      const toggle = page.locator('#menu-icon');
      await toggle.click();
      assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
      assert(await page.locator('#moody-menu-drawer').evaluate(el => {
        const rect = el.getBoundingClientRect();
        return rect.left >= 0 && rect.right <= innerWidth + 1 && el.scrollWidth <= el.clientWidth;
      }), `Mobile drawer overflow at ${width}`);
      await page.keyboard.press('Escape');
      assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
    }
    console.log('Desktop branding/search separation passed at 1200–1920px.');
  } finally { await browser.close(); }
})().catch(error => {console.error(error); process.exit(1);});
