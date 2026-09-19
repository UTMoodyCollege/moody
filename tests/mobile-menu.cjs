// Run with Playwright available: node tests/mobile-menu.cjs <main-page-url> <subsite-page-url>
// Optional: MOODY_MENU_LOGIN_URL, CHROME_PATH, MOODY_MENU_SCREENSHOTS (existing directory).
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

(async () => {
  assert(process.argv.length > 2, 'Provide at least one page URL');
  const browser = await chromium.launch({headless: true, executablePath: process.env.CHROME_PATH || undefined});
  try {
    const page = await browser.newPage({ignoreHTTPSErrors: true});
    if (process.env.MOODY_MENU_LOGIN_URL) await page.goto(process.env.MOODY_MENU_LOGIN_URL);
    for (const [index, url] of process.argv.slice(2).entries()) {
      await page.goto(url);
      for (const width of [320, 375, 414, 768]) {
        await page.setViewportSize({width, height: 812});
        await page.waitForTimeout(400); // Existing resize debounce and menu transition.
        const openToolbar = page.locator('.toolbar-bar .trigger[aria-pressed="true"]');
        if (await openToolbar.count()) await openToolbar.first().click();
        await page.waitForTimeout(200);
        const toggle = page.locator('#menu-icon');
        await toggle.click();
        await page.waitForTimeout(200);
        assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
        const state = await page.locator('#moody-header').evaluate(header => {
          const drawer = header.querySelector('.nav-wrapper');
          const rect = drawer.getBoundingClientRect();
          const title = header.querySelector('.p2-logo .mobile_wordmark');
          const close = header.querySelector('#menu-icon').getBoundingClientRect();
          return {
            fits: rect.left >= 0 && rect.right <= innerWidth && rect.bottom <= innerHeight + 1,
            noOverflow: drawer.scrollWidth <= drawer.clientWidth,
            titleClear: title.getBoundingClientRect().right - parseFloat(getComputedStyle(title).paddingRight) <= close.left,
            closeSize: close.width >= 44 && close.height >= 44,
            utilities: header.querySelectorAll('[data-menu-utilities]').length,
            mobileUtilities: header.querySelectorAll('[data-menu-utilities-mobile] [data-menu-utilities]').length,
          };
        });
        assert(state.fits && state.noOverflow && state.titleClear && state.closeSize, JSON.stringify({url, width, state}));
        assert.equal(state.utilities, state.mobileUtilities, 'Subsite utilities must move into the drawer exactly once');
        if (process.env.MOODY_MENU_SCREENSHOTS) await page.screenshot({path: `${process.env.MOODY_MENU_SCREENSHOTS}/menu-${index}-${width}.png`});
        await page.keyboard.press('Escape');
        assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
        assert(await toggle.evaluate(el => el === document.activeElement));
        assert(!(await page.locator('body').evaluate(el => el.classList.contains('overflow-hidden'))));
        await toggle.click();
        await page.setViewportSize({width: 1280, height: 900});
        await page.waitForTimeout(400);
        assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
        assert(!(await page.locator('body').evaluate(el => el.classList.contains('overflow-hidden'))));
        assert.equal(await page.locator('[data-menu-utilities-mobile] [data-menu-utilities]').count(), 0);
        assert.equal(await page.locator('[data-menu-utilities-home] [data-menu-utilities]').count(), state.utilities);
      }
      if (process.env.MOODY_MENU_SCREENSHOTS) await page.screenshot({path: `${process.env.MOODY_MENU_SCREENSHOTS}/menu-${index}-desktop.png`});
      console.log(`PASS: ${url} — mobile widths, Escape, resize, and utility placement`);
    }
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
