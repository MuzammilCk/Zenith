import puppeteer from 'puppeteer';
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await page.waitForSelector('#root > *', { timeout: 5000 });
  const html = await page.evaluate(() => document.body.innerHTML);
  console.log(html.substring(0, 500));
  await browser.close();
})();
