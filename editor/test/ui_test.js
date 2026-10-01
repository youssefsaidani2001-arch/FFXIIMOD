// Browser smoke test of editor/index.html. Needs playwright; run from a folder where it is installed:
//   NODE_PATH=<dir>/node_modules node editor/test/ui_test.js
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), os = require('os');
(async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fxs-'));
  require('child_process').execFileSync('node', [path.join(__dirname, 'make_sample_vbf.js'), path.join(tmp, 'FFXII_TZA.vbf')]);
  const frag = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  fs.writeFileSync(path.join(tmp, 'page.html'), '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>' + frag + '</body></html>');
  const browser = await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  const errors = []; page.on('pageerror', e => errors.push(String(e))); page.on('console', m => { if (m.type() === 'error' && !/ERR_CERT|fonts\.g/.test(m.text())) errors.push(m.text()); });
  await page.goto('file://' + path.join(tmp, 'page.html'));
  const out = {};
  // 1. battlepack sample
  await page.selectOption('#editorPick', 'battlepack'); await page.click('#btnSample'); await page.waitForTimeout(200);
  out.sections = await page.$$eval('#secList li', l => l.length);
  await page.click('#secList li:has-text("Actions")');
  await page.fill('#rowFilter', '#480'); await page.waitForTimeout(80); await page.click('#rowList li');
  await page.fill('#f_14_10_mpOrMistCost', '7'); await page.dispatchEvent('#f_14_10_mpOrMistCost', 'change');
  await page.check('#f_14_12_30');
  out.count1 = await page.$eval('#changeCount', e => e.textContent);
  out.nested = await page.$$eval('#secList li', l => l.filter(x => x.textContent.includes('61.')).length);
  out.exports = await page.$$eval('#exports button', b => b.map(x => x.textContent));
  await page.screenshot({ path: path.join(tmp, 'battlepack.png') });
  // 2. VBF: open archive, search, open battle_pack.bin from it
  await page.selectOption('#editorPick', 'auto');
  await page.setInputFiles('#openFile', path.join(tmp, 'FFXII_TZA.vbf'));
  await page.waitForSelector('#vbfRows tr');
  out.vbfRows = await page.$$eval('#vbfRows tr', r => r.length);
  await page.fill('#vbfSearch', 'battle_pack'); await page.dispatchEvent('#vbfSearch', 'input');
  await page.click('#vbfRows tr button:has-text("Open")');
  await page.waitForTimeout(400);
  out.afterOpen = await page.$eval('#fileName', e => e.textContent);
  out.backVisible = await page.$eval('#btnBack', e => !e.hidden);
  await page.screenshot({ path: path.join(tmp, 'vbf_open.png') });
  await page.click('#btnBack'); await page.waitForTimeout(150);
  out.backTo = await page.$eval('#fileName', e => e.textContent);
  await page.setViewportSize({ width: 400, height: 800 }); await page.waitForTimeout(150);
  out.overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  out.errors = errors;
  console.log(JSON.stringify(out, null, 1));
  console.log('SCREENSHOTS', tmp);
  await browser.close();
  if (errors.length || out.vbfRows < 1 || !/battle_pack/.test(out.afterOpen)) process.exit(1);
})().catch(e => { console.error('UI TEST FAIL', e); process.exit(1); });
