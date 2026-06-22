import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const pages = [
  { name: 'Home', path: '/' },
  { name: 'Discover', path: '/discover' },
  { name: 'Marketplace', path: '/marketplace' },
  { name: 'Login', path: '/login' },
  { name: 'Signup', path: '/signup' },
  { name: 'Pricing', path: '/pricing' },
  { name: 'Ecosystem', path: '/ecosystem' },
  { name: 'Arena', path: '/arena' },
  { name: 'Battle', path: '/battle' },
  { name: 'Booster Packs', path: '/booster-packs' },
  { name: 'Catalyst', path: '/catalyst' },
  { name: 'Challenge', path: '/challenge' },
  { name: 'Contact', path: '/contact' },
  { name: 'Events', path: '/events' },
  { name: 'Intelligence', path: '/intelligence' },
  { name: 'Investors', path: '/investors' },
  { name: 'Live', path: '/live' },
];

const outDir = 'C:\\Users\\HP\\.gemini\\antigravity\\brain\\2b6a80d8-d145-46d7-8058-b726053f5eac';

async function run() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 1080 } });
  const page = await context.newPage();

  for (const route of pages) {
    try {
      console.log(`Navigating to ${route.name}...`);
      await page.goto(`http://localhost:3000${route.path}`, { waitUntil: 'networkidle', timeout: 15000 });
      // wait a bit for animations
      await page.waitForTimeout(2000);
      const safeName = route.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
      const dest = path.join(outDir, `${safeName}.png`);
      await page.screenshot({ path: dest, fullPage: false });
      console.log(`Saved screenshot for ${route.name} to ${dest}`);
    } catch (e) {
      console.error(`Failed to screenshot ${route.name}: ${e.message}`);
    }
  }

  await browser.close();
}

run().catch(console.error);
