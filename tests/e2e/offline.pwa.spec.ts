import { networkInterfaces } from 'node:os';
import { expect, test, type Page } from '@playwright/test';

const SAVE_KEY = 'roll-for-profit:save:v1';

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => {
    const original = crypto.getRandomValues.bind(crypto);
    Object.defineProperty(crypto, 'getRandomValues', {
      configurable: true,
      value(array: ArrayBufferView) {
        if (array instanceof Uint32Array && array.length === 1) {
          array[0] = 2;
          return array;
        }
        return original(array);
      },
    });
  });
});

async function saved(page: Page) {
  return page.evaluate((key) => JSON.parse(localStorage.getItem(key) || 'null'), SAVE_KEY);
}

async function controlledProductionApp(page: Page) {
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'New Game', exact: true })).toBeVisible();
  await page.waitForFunction(async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    return registration?.active?.state === 'activated';
  });
  await page.waitForFunction(() => navigator.serviceWorker.controller?.state === 'activated');
}

async function finishCharacter(page: Page) {
  await page.getByRole('button', { name: 'Roll All Attributes', exact: true }).click();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('button', { name: 'Select Born Closer', exact: true }).click();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('button', { name: 'Select The Deal Maker', exact: true }).click();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('button', { name: 'Start Adventure', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'The Call to Adventure', exact: true })).toBeVisible();
}

async function beginCharacter(page: Page) {
  await page.getByRole('button', { name: 'New Game', exact: true }).click();
  await page.getByRole('button', { name: 'Create Your Entrepreneur', exact: true }).click();
  await page.getByLabel(/WHAT SHOULD WE CALL YOU/i).fill('Offline Avery');
}

test('production manifest, installation icons, app assets, and fonts survive an offline reload', async ({ page, context, baseURL }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await controlledProductionApp(page);
  const manifestHref = await page.locator('link[rel="manifest"]').getAttribute('href');
  expect(manifestHref).toBeTruthy();
  const manifestURL = new URL(manifestHref!, baseURL).href;
  const response = await page.request.get(manifestURL);
  expect(response.ok()).toBe(true);
  const manifest = await response.json() as {
    id: string; name: string; short_name: string; lang: string;
    display: string; start_url: string; scope: string;
    icons: { src: string; sizes: string; type: string }[];
  };
  expect(manifest).toMatchObject({
    id: '/', name: 'Roll For Profit: The Startup Phase', short_name: 'Roll For Profit',
    lang: 'en', display: 'standalone', start_url: '/', scope: '/',
  });
  for (const size of [192, 512]) {
    const icon = manifest.icons.find((entry) => entry.sizes.split(/\s+/).includes(`${size}x${size}`));
    expect(icon, `installation icon ${size}x${size}`).toBeDefined();
    expect(icon!.type).toBe('image/png');
    const dimensions = await page.evaluate(async (src) => {
      const image = new Image();
      image.src = src;
      await image.decode();
      return [image.naturalWidth, image.naturalHeight];
    }, new URL(icon!.src, manifestURL).href);
    expect(dimensions).toEqual([size, size]);
  }

  const cachedPaths = await page.evaluate(async () => {
    const requests = (await Promise.all((await caches.keys()).map(async (key) => (await caches.open(key)).keys()))).flat();
    return requests.map((request) => new URL(request.url).pathname);
  });
  expect(cachedPaths).toContain('/index.html');
  expect(cachedPaths).toContain('/icons/icon-192.png');
  expect(cachedPaths).toContain('/icons/icon-512.png');
  expect(cachedPaths).toContain('/assets/original-character-sheet.png');
  expect(cachedPaths).toContain(new URL(manifestURL).pathname);
  const script = cachedPaths.find((path) => /^\/assets\/.*\.js$/.test(path));
  const stylesheet = cachedPaths.find((path) => /^\/assets\/.*\.css$/.test(path));
  const font = cachedPaths.find((path) => /\.woff2?$/.test(path));
  expect(script).toBeDefined();
  expect(stylesheet).toBeDefined();
  expect(font).toBeDefined();

  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('button', { name: 'New Game', exact: true })).toBeVisible();
  const offlineAssets = await page.evaluate(async (urls) => Promise.all(urls.map(async (url) => {
    const result = await fetch(url);
    return { url, ok: result.ok, bytes: (await result.arrayBuffer()).byteLength };
  })), [script!, stylesheet!, font!, manifestURL, '/icons/icon-192.png', '/icons/icon-512.png', '/assets/original-character-sheet.png']);
  for (const asset of offlineAssets) {
    expect(asset.ok, `offline asset ${asset.url}`).toBe(true);
    expect(asset.bytes, `offline bytes ${asset.url}`).toBeGreaterThan(0);
  }
  const loadedFonts = await page.evaluate(async () => {
    await Promise.all(['DM Sans', 'Lora', 'Bebas Neue'].map((family) => document.fonts.load(`400 16px "${family}"`)));
    return ['DM Sans', 'Lora', 'Bebas Neue'].map((family) => ({
      family, loaded: [...document.fonts].some((face) => face.family.replace(/["']/g, '') === family && face.status === 'loaded'),
    }));
  });
  for (const face of loadedFonts) expect(face.loaded, `${face.family} loads offline`).toBe(true);
  expect(errors).toEqual([]);
});

test('partly rolled character creation saves and resumes while the production app is offline', async ({ page, context }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await controlledProductionApp(page);
  await context.setOffline(true);
  await beginCharacter(page);
  await page.getByRole('button', { name: 'Roll Creativity', exact: true }).click();
  await page.getByRole('button', { name: 'Roll Tactics', exact: true }).click();
  const partial = await saved(page);
  expect(partial).toMatchObject({ phase: 'creation', name: 'Offline Avery', rolled: ['CR', 'TA'], baseStats: { CR: 3, TA: 3, RE: 0, NE: 0, TS: 0 } });
  await page.reload();
  await page.getByRole('button', { name: 'Continue Game', exact: true }).click();
  expect(await saved(page)).toEqual(partial);
  await expect(page.getByRole('button', { name: 'Roll Creativity', exact: true })).toHaveCount(0);
  await finishCharacter(page);
  const complete = await saved(page);
  expect(complete).toMatchObject({ phase: 'adventure', sectionId: '1', name: 'Offline Avery', rolled: ['CR', 'TA', 'RE', 'NE', 'TS'] });
  await page.reload();
  await page.getByRole('button', { name: 'Continue Game', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'The Call to Adventure', exact: true })).toBeVisible();
  expect(await saved(page)).toEqual(complete);
  expect(errors).toEqual([]);
});

test('an offline funding roll survives reload and commits its Capital/stat consequence exactly once', async ({ page, context }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await controlledProductionApp(page);
  await beginCharacter(page);
  await finishCharacter(page);
  await page.getByRole('button', { name: /Side hustle while keeping your job/ }).click();
  await page.getByRole('button', { name: /Take out a small loan to speed up the process/ }).click();
  await context.setOffline(true);
  await page.getByRole('button', { name: 'Roll Dice', exact: true }).click();
  await expect(page.getByLabel('Roll total 9', { exact: true })).toBeVisible();
  const pending = await saved(page);
  expect(pending).toMatchObject({ phase: 'roll-result', sectionId: '10', capital: 1000, pendingRoll: { dice: [3, 3], modifier: 3, total: 9 } });
  await page.reload();
  await page.getByRole('button', { name: 'Continue Game', exact: true }).click();
  await expect(page.getByLabel('Roll total 9', { exact: true })).toBeVisible();
  expect(await saved(page)).toEqual(pending);
  await page.getByRole('button', { name: 'Continue Adventure', exact: true }).click();
  const resolved = await saved(page);
  expect(resolved).toMatchObject({ phase: 'adventure', sectionId: '32', capital: 2000, statChanges: { TA: -1 }, pendingRoll: null });
  await page.reload();
  await page.getByRole('button', { name: 'Continue Game', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'The Cost of Borrowing – Money with Strings Attached', exact: true })).toBeVisible();
  expect(await saved(page)).toEqual(resolved);
  expect(errors).toEqual([]);
});

test('a plain LAN HTTP preview can create, roll, save, and resume without randomUUID', async ({ page, baseURL }) => {
  const address = Object.values(networkInterfaces()).flat().find((entry) => entry?.family === 'IPv4' && !entry.internal)?.address;
  expect(address, 'a non-loopback IPv4 address is required to exercise an actual insecure preview origin').toBeTruthy();
  const url = new URL('/', baseURL);
  url.hostname = address!;
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(url.href);
  expect(await page.evaluate(() => window.isSecureContext)).toBe(false);
  expect(await page.evaluate(() => typeof crypto.randomUUID)).toBe('undefined');
  await beginCharacter(page);
  await finishCharacter(page);
  const state = await saved(page);
  expect(state).toMatchObject({ phase: 'adventure', sectionId: '1', rolled: ['CR', 'TA', 'RE', 'NE', 'TS'], baseStats: { CR: 3, TA: 3, RE: 3, NE: 3, TS: 3 } });
  expect(state.runId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  await page.reload();
  await page.getByRole('button', { name: 'Continue Game', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'The Call to Adventure', exact: true })).toBeVisible();
  expect(await saved(page)).toEqual(state);
  expect(errors).toEqual([]);
});
