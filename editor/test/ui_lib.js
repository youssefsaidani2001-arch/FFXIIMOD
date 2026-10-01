// Shared helper for browser tests. Builds the page into a temp folder (never touches editor/index.html),
// opens it in Chromium and collects page errors.
//   const { openSuite } = require('./ui_lib');
//   const s = await openSuite({ only: ['tim2'] });   // s.page, s.tmp, s.errors, await s.close()
// Run tests with: NODE_PATH=<dir with playwright>/node_modules node editor/test/ui_<id>_test.js
const fs = require('fs'), path = require('path'), os = require('os'), cp = require('child_process');
async function openSuite(opts) {
  opts = opts || {};
  const { chromium } = require('playwright');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fxs-'));
  const built = path.join(tmp, 'index.html');
  cp.execFileSync('python3', [path.join(__dirname, '..', 'build.py'), '--out', built].concat(opts.only ? ['--only', opts.only.join(',')] : []), { stdio: 'pipe' });
  const frag = fs.readFileSync(built, 'utf8');
  fs.writeFileSync(path.join(tmp, 'page.html'), '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>' + frag + '</body></html>');
  const browser = await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const page = await browser.newPage({ viewport: opts.viewport || { width: 1400, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error' && !/ERR_CERT|fonts\.g|net::ERR/.test(m.text())) errors.push(m.text()); });
  await page.goto('file://' + path.join(tmp, 'page.html'));
  return {
    page, tmp, errors, browser,
    /** pick an editor in the format list and load its synthetic sample */
    async sample(id) { await page.selectOption('#editorPick', id); await page.click('#btnSample'); await page.waitForTimeout(150); },
    /** open a file from disk through the Open button */
    async openPath(p) { await page.setInputFiles('#openFile', p); await page.waitForTimeout(300); },
    async close() { await browser.close(); },
  };
}
module.exports = { openSuite };
