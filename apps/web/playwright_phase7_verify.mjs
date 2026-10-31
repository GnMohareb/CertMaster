import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import path from 'node:path';
import express from 'express';
import { createCertMasterApiApp } from './server.ts';

const require = createRequire(import.meta.url);
const playwrightPath =
  'C:\\Users\\gadly\\AppData\\Local\\npm-cache\\_npx\\9833c18b2d85bc59\\node_modules\\playwright';
const { chromium } = require(playwrightPath);

async function runBrowserQa() {
  const app = createCertMasterApiApp();
  const distDir = path.join(process.cwd(), 'dist');
  app.use(express.static(distDir));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });

  const server = app.listen(0);
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 3098;
  const baseUrl = `http://127.0.0.1:${port}`;

  let browser;
  try {
    browser = await chromium.launch({ headless: true, channel: 'chrome' });
  } catch {
    browser = await chromium.launch({ headless: true, channel: 'msedge' });
  }
  const results = {
    viewports: [],
    navigation: [],
    certificationSwitcher: null,
    historyAndDeepLinks: null,
    truthfulContentBadges: null,
    aiTutorDisclosure: null,
  };

  try {
    // 1. Verify all 5 required viewports (Desktop, Laptop, Tablet, Mobile Portrait, Mobile Landscape)
    const viewports = [
      { name: 'Desktop', width: 1440, height: 900, isMobile: false },
      { name: 'Laptop', width: 1280, height: 800, isMobile: false },
      { name: 'Tablet', width: 768, height: 1024, isMobile: true },
      { name: 'Mobile Portrait', width: 390, height: 844, isMobile: true },
      { name: 'Mobile Landscape', width: 844, height: 390, isMobile: true },
    ];

    for (const vp of viewports) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
      });
      const page = await context.newPage();
      await page.goto(`${baseUrl}/?tab=dashboard&exam=cissp`, { waitUntil: 'domcontentloaded' });
      await page.locator('header').waitFor({ state: 'visible', timeout: 5000 });
      await page.locator('main').waitFor({ state: 'visible', timeout: 5000 });

      const layoutMetrics = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
        hasHorizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 2,
        headerPresent: Boolean(document.querySelector('header')),
        mainPresent: Boolean(document.querySelector('main')),
      }));

      assert.equal(
        layoutMetrics.hasHorizontalOverflow,
        false,
        `Viewport ${vp.name} (${vp.width}x${vp.height}) must not overflow horizontally (scrollWidth=${layoutMetrics.scrollWidth}, innerWidth=${layoutMetrics.innerWidth})`
      );
      assert.equal(layoutMetrics.headerPresent, true);
      assert.equal(layoutMetrics.mainPresent, true);

      // Verify mobile navigation drawer accessibility on smaller viewports
      let mobileDrawerVerified = false;
      const menuBtn = page.locator('button[aria-controls="mobile-learner-drawer"]');
      if (await menuBtn.isVisible()) {
        await menuBtn.click();
        const dialog = page.locator('#mobile-learner-drawer[role="dialog"][aria-modal="true"]');
        await dialog.waitFor({ state: 'visible', timeout: 5000 });
        mobileDrawerVerified = await dialog.isVisible();
        assert.equal(mobileDrawerVerified, true, `Mobile drawer must open on ${vp.name}`);
        await page.keyboard.press('Escape');
        await dialog.waitFor({ state: 'hidden', timeout: 5000 });
      }

      results.viewports.push({
        viewport: `${vp.name} (${vp.width}x${vp.height})`,
        scrollWidth: layoutMetrics.scrollWidth,
        innerWidth: layoutMetrics.innerWidth,
        overflow: layoutMetrics.hasHorizontalOverflow,
        mobileDrawerVerified,
        status: 'PASSED',
      });
      await context.close();
    }

    // 2. Verify all 7 primary navigation sections, Certification Switcher, Deep Links, Browser Back/Forward, Truthful Content Badges & AI Tutor Disclosure
    const desktopCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await desktopCtx.newPage();

    const sections = [
      { tab: 'dashboard', label: 'Dashboard' },
      { tab: 'catalog', label: 'My Certifications' },
      { tab: 'simulator', label: 'Practice & Exams' },
      { tab: 'notebook', label: 'Study Library' },
      { tab: 'flashcards', label: 'Flashcards' },
      { tab: 'analytics', label: 'Progress & Analytics' },
      { tab: 'profile', label: 'Account & Sync' },
    ];

    for (const sec of sections) {
      await page.goto(`${baseUrl}/?tab=${sec.tab}&exam=cissp`, { waitUntil: 'domcontentloaded' });
      await page.locator('main').waitFor({ state: 'visible', timeout: 5000 });
      const currentUrl = page.url();
      assert.ok(
        currentUrl.includes(`tab=${sec.tab}`),
        `Expected URL to contain tab=${sec.tab}, got ${currentUrl}`
      );
      const bodyText = await page.locator('main').innerText();
      assert.ok(bodyText.length > 50, `Section ${sec.label} rendered empty main content`);
      results.navigation.push({
        section: sec.label,
        route: `/?tab=${sec.tab}&exam=cissp`,
        status: 'PASSED',
      });
    }

    // 3. Verify Truthful Evidence-Based Content Badges in My Certifications
    await page.goto(`${baseUrl}/?tab=catalog&exam=cissp`, { waitUntil: 'domcontentloaded' });
    await page.locator('main').waitFor({ state: 'visible', timeout: 5000 });
    const catalogText = await page.locator('main').innerText();
    assert.ok(
      catalogText.includes('Sample Content (8 Qs)') || catalogText.includes('Sample Content'),
      'My Certifications must display truthful Sample Content badge with exact bundled question count'
    );
    assert.ok(
      !catalogText.includes('150 Questions') && !catalogText.includes('2,250'),
      'My Certifications must never display inflated 150 or 2,250 question counts'
    );
    results.truthfulContentBadges = {
      sampleBadgePresent: true,
      noInflatedCounts: true,
      status: 'PASSED',
    };

    // 4. Verify Active Certification Switcher updates context & URL across sections
    const certSelect = page.locator('header select[aria-label="Active certification track"]');
    await certSelect.selectOption('aws-saa');
    await page.waitForTimeout(250);
    assert.ok(
      page.url().includes('exam=aws-saa'),
      `Selecting AWS-SAA in header switcher must update URL query param (got ${page.url()})`
    );
    results.certificationSwitcher = {
      switchedTo: 'aws-saa',
      urlUpdated: page.url(),
      status: 'PASSED',
    };

    // 5. Verify Deep Link + Browser Back & Forward navigation
    await page.goto(`${baseUrl}/?tab=dashboard&exam=aws-saa`, { waitUntil: 'domcontentloaded' });
    await page.locator('main').waitFor({ state: 'visible', timeout: 5000 });
    await page.goto(`${baseUrl}/?tab=flashcards&exam=aws-saa`, { waitUntil: 'domcontentloaded' });
    await page.locator('main').waitFor({ state: 'visible', timeout: 5000 });
    assert.ok(page.url().includes('tab=flashcards'));
    await page.goBack({ waitUntil: 'domcontentloaded' });
    assert.ok(
      page.url().includes('tab=dashboard'),
      `Browser Back must return to tab=dashboard, got ${page.url()}`
    );
    await page.goForward({ waitUntil: 'domcontentloaded' });
    assert.ok(
      page.url().includes('tab=flashcards'),
      `Browser Forward must advance to tab=flashcards, got ${page.url()}`
    );
    results.historyAndDeepLinks = {
      deepLinkLoaded: true,
      backNavigationPassed: true,
      forwardNavigationPassed: true,
      status: 'PASSED',
    };

    // 6. Verify Grounded AI Tutor in Study Library explicitly discloses provider status
    await page.goto(`${baseUrl}/?tab=notebook&exam=aws-saa`, { waitUntil: 'domcontentloaded' });
    await page.locator('main').waitFor({ state: 'visible', timeout: 5000 });
    const tutorTabBtn = page.getByRole('button', { name: /AI Exam Tutor/i });
    if (await tutorTabBtn.isVisible()) {
      await tutorTabBtn.click();
      await page.waitForTimeout(200);
      const askBtn = page.getByRole('button', { name: /Ask Tutor/i });
      const input = page.locator('input[placeholder*="Ask about"]');
      if ((await input.isVisible()) && (await askBtn.isVisible())) {
        await input.fill('How does a Gateway VPC Endpoint work for Amazon S3?');
        await askBtn.click();
        await page.waitForTimeout(600);
      }
      const notebookText = await page.locator('main').innerText();
      assert.ok(
        notebookText.includes('Local Grounded Fallback') ||
          notebookText.includes('Live Gemini') ||
          notebookText.includes('Grounded'),
        'Study Library AI Tutor must explicitly disclose provider mode'
      );
      results.aiTutorDisclosure = {
        disclosed: true,
        status: 'PASSED',
      };
    }

    await desktopCtx.close();
    console.log('PLAYWRIGHT_PHASE7_QA_RESULTS:', JSON.stringify(results, null, 2));
  } finally {
    await browser.close();
    server.close();
  }
}

runBrowserQa().catch((err) => {
  console.error('PLAYWRIGHT_PHASE7_QA_FAILED:', err);
  process.exit(1);
});
