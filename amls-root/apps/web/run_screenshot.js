const { chromium } = require('playwright-core');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('http://localhost:3001/progress', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    await page.screenshot({ path: 'screenshot.png' });
    console.log("Screenshot saved to screenshot.png");

    await browser.close();
})();
