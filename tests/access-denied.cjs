// NODE_PATH=<existing Playwright modules> node tests/access-denied.cjs <403-page-url>...
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

(async () => {
  assert(process.argv.length > 2, 'Provide a protected page URL');
  const browser = await chromium.launch({headless: true});
  try {
    const page = await browser.newPage({ignoreHTTPSErrors: true});
    for (const url of process.argv.slice(2)) {
      for (const width of [375, 768, 1440]) {
        await page.setViewportSize({width, height: 900});
        const response = await page.goto(url);
        assert.equal(response.status(), 403, `${url}: access must remain denied`);
        const heading = page.getByRole('heading', {name: 'Need access to edit?'});
        assert.equal(await heading.count(), 1);
        const login = page.getByRole('link', {name: 'Log in with your EID', exact: true});
        assert((await login.getAttribute('href')).endsWith('/saml/login'));
        const request = page.getByRole('link', {name: 'Request editing access', exact: true});
        assert.equal(await request.getAttribute('href'), 'https://form.asana.com/?k=qgvf7ATUPYXTUCJ_AvfugQ&d=939520625567004');
        assert.equal(await page.getByRole('link', {name: 'Documentation for web users', exact: true}).getAttribute('href'), 'https://webusersguide.moody.utexas.edu/');
        assert(await heading.isVisible() && await login.isVisible() && await request.isVisible());
        assert(await login.evaluate(el => {
          const r = el.getBoundingClientRect();
          return r.left >= 0 && r.right <= innerWidth;
        }), 'Login link overflows the viewport');
        await login.focus();
        assert(await login.evaluate(el => document.activeElement === el));
      }
      console.log(`PASS: ${url} — 403 retained, EID and request links at three widths`);
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
