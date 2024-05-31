import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // Increase the navigation timeout
    await page.goto('https://typli.ai/ai-text-generator', { timeout: 1000000000 });
    await page.waitForSelector('textarea#essay')
    await page.type('textarea#essay', 'faz um site moderno, responsivo, bonito e muito detalhado, com html e css tudo num arquivo só')
    await page.click('button.bg-primary')
})();
