import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  args: ['--headless=new', '--no-sandbox'],
  defaultViewport: { width: 1280, height: 800 },
  timeout: 120000,
});
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.goto(process.argv[2] || 'http://127.0.0.1:5191/', { waitUntil: 'networkidle0' });
await new Promise((r) => setTimeout(r, 2000));
const el = await page.$('.stats');
await el.scrollIntoView();
await new Promise((r) => setTimeout(r, 1200));
console.log(await page.evaluate(() => ({
  hidden: document.querySelector('.stats__live').hidden,
  nums: [...document.querySelectorAll('[data-count]')].map((n) => `${n.dataset.count}=${n.textContent}`),
})));
await el.screenshot({ path: '/tmp/sb/site-stats.png' });
await page.setViewport({ width: 390, height: 800 });
await new Promise((r) => setTimeout(r, 600));
await (await page.$('.stats')).screenshot({ path: '/tmp/sb/site-stats-mobile.png' });
console.log('errors', JSON.stringify(errors));
await browser.close();
