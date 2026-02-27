const { chromium } = require('playwright-core');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', err => {
        errors.push(err.message);
    });
    page.on('console', msg => {
        if (msg.type() === 'error') {
            errors.push(msg.text());
        }
    });

    await page.goto('http://localhost:3000/progress');
    await page.waitForTimeout(2000); // Wait for potential client-side errors

    console.log("Captured errors on /progress:", errors);
    await browser.close();
})();
