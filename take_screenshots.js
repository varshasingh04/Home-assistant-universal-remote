const { chromium } = require('playwright');
const path = require('path');

const HA_URL = 'http://192.168.1.11:8123';
const USERNAME = 'varsha';   // ← change to your HA username
const PASSWORD = 'varsha8varsha';  // ← change to your HA password
const OUT = path.join(__dirname, 'screenshots');

async function shot(page, name) {
  await page.screenshot({ path: path.join(OUT, name), fullPage: true });
  console.log('✓ ' + name);
}

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  page.setDefaultTimeout(30000);

  // ── 1. Login ─────────────────────────────────────────────────────
  console.log('Logging in...');
  await page.goto(HA_URL);
  await page.waitForSelector('input[name="username"]', { timeout: 15000 });
  await page.fill('input[name="username"]', USERNAME);
  await page.fill('input[name="password"]', PASSWORD);
  await page.click('mwc-button[label="Log In"]');
  await page.waitForNavigation({ waitUntil: 'networkidle' });
  console.log('Logged in.');

  // ── 2. HA main dashboard (proves HA is running) ──────────────────
  await page.goto(HA_URL + '/lovelace/0');
  await page.waitForTimeout(3000);
  await shot(page, '01_ha_main_dashboard.png');

  // ── 3. Remote Control view ───────────────────────────────────────
  await page.goto(HA_URL + '/universal-remote/remote');
  await page.waitForTimeout(3000);
  await shot(page, '02_remote_control_view.png');

  // ── 4. Click Apple TV source → screenshot highlighted button ─────
  await page.goto(HA_URL + '/universal-remote/remote');
  await page.waitForTimeout(2000);
  // Turn on TV first so binary sensors activate
  const tvButton = page.locator('ha-card').filter({ hasText: 'TV Power' }).first();
  await tvButton.click();
  await page.waitForTimeout(1500);
  // Click Apple TV source button
  const appleBtn = page.locator('ha-card').filter({ hasText: 'Apple TV' }).first();
  await appleBtn.click();
  await page.waitForTimeout(2000);
  await shot(page, '03_source_apple_tv_active.png');

  // ── 5. Switch to Chromecast ──────────────────────────────────────
  const chromeCast = page.locator('ha-card').filter({ hasText: 'Chromecast' }).first();
  await chromeCast.click();
  await page.waitForTimeout(2000);
  await shot(page, '04_source_chromecast_active.png');

  // ── 6. Switch to PlayStation 5 ───────────────────────────────────
  const ps5 = page.locator('ha-card').filter({ hasText: 'PlayStation 5' }).first();
  await ps5.click();
  await page.waitForTimeout(2000);
  await shot(page, '05_source_ps5_active.png');

  // ── 7. Switch to Fire TV ─────────────────────────────────────────
  const fireTV = page.locator('ha-card').filter({ hasText: 'Fire TV' }).first();
  await fireTV.click();
  await page.waitForTimeout(2000);
  await shot(page, '06_source_firetv_active.png');

  // ── 8. Volume controls ───────────────────────────────────────────
  const volUp = page.locator('ha-card').filter({ hasText: 'Vol +' }).first();
  await volUp.click();
  await volUp.click();
  await volUp.click();
  await page.waitForTimeout(1500);
  await shot(page, '07_volume_changed.png');

  // ── 9. Power Off All ─────────────────────────────────────────────
  const powerOff = page.locator('ha-card').filter({ hasText: 'Power Off All' }).first();
  await powerOff.click();
  await page.waitForTimeout(2000);
  await shot(page, '08_power_off_all.png');

  // ── 10. Debug / Status view ──────────────────────────────────────
  await page.goto(HA_URL + '/universal-remote/debug');
  await page.waitForTimeout(3000);
  await shot(page, '09_debug_status_view.png');

  // ── 11. Turn TV on to show AVR follows ───────────────────────────
  await page.goto(HA_URL + '/universal-remote/remote');
  await page.waitForTimeout(2000);
  const tvBtn2 = page.locator('ha-card').filter({ hasText: 'TV Power' }).first();
  await tvBtn2.click();
  await page.waitForTimeout(2500);
  await page.goto(HA_URL + '/universal-remote/debug');
  await page.waitForTimeout(2000);
  await shot(page, '10_avr_follows_tv_on.png');

  // ── 12. Developer Tools → States ────────────────────────────────
  await page.goto(HA_URL + '/developer-tools/state');
  await page.waitForTimeout(3000);
  // Filter to show our entities
  const filterBox = page.locator('input[placeholder*="Filter"]');
  if (await filterBox.isVisible()) {
    await filterBox.fill('input_select');
    await page.waitForTimeout(1000);
  }
  await shot(page, '11_dev_tools_states.png');

  // ── 13. Full entity list ─────────────────────────────────────────
  if (await filterBox.isVisible()) {
    await filterBox.fill('active_source');
    await page.waitForTimeout(1000);
  }
  await shot(page, '12_dev_tools_active_source_entity.png');

  console.log('\nAll screenshots saved to: ' + OUT);
  await browser.close();
})();
