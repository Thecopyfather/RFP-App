import { expect, test, type Page } from '@playwright/test';

const SAVE_KEY = 'roll-for-profit:save:v1';

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => {
    // Production still calls its cryptographic adapter. A uint32 of 2 maps to face 3.
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

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
}

async function createEntrepreneur(page: Page, mentorName = 'The Deal Maker') {
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'New Game', exact: true })).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.getByRole('button', { name: 'New Game', exact: true }).click();
  await expect(page.getByRole('heading', { name: /Your journey/ })).toBeFocused();
  await page.getByRole('button', { name: 'Create Your Entrepreneur', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Every great story starts with you.', exact: true })).toBeFocused();
  await page.getByLabel(/WHAT SHOULD WE CALL YOU/i).fill('Avery');
  await page.getByRole('button', { name: 'Roll All Attributes', exact: true }).click();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Find your unfair advantage.', exact: true })).toBeFocused();
  await page.getByRole('button', { name: 'Select Born Closer', exact: true }).click();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('button', { name: `Select ${mentorName}`, exact: true }).click();
  await expectNoHorizontalOverflow(page);
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('button', { name: 'Start Adventure', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'The Call to Adventure', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'The Call to Adventure', exact: true })).toBeFocused();
}

test('plays an original funding check, restores committed dice, and tracks the consequence', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await createEntrepreneur(page);
  await page.getByRole('button', { name: /Side hustle while keeping your job/ }).click();
  await page.getByRole('button', { name: /Take out a small loan to speed up the process/ }).click();
  await expect(page.getByRole('heading', { name: 'Borrowing to Invest', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Roll Dice', exact: true }).click();
  await expect(page.getByRole('img', { name: 'First die: 3', exact: true })).toBeVisible();
  await expect(page.getByRole('img', { name: 'Second die: 3', exact: true })).toBeVisible();
  await expect(page.getByLabel('Roll total 9', { exact: true })).toBeVisible();
  const committed = await saved(page);
  expect(committed.phase).toBe('roll-result');
  expect(committed.capital).toBe(1000);
  expect(committed.pendingRoll).toMatchObject({ dice: [3, 3], modifier: 3, total: 9 });

  await page.reload();
  await page.getByRole('button', { name: 'Continue Game', exact: true }).click();
  await expect(page.getByLabel('Roll total 9', { exact: true })).toBeVisible();
  expect((await saved(page)).pendingRoll).toEqual(committed.pendingRoll);
  await page.getByRole('button', { name: 'Continue Adventure', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'The Cost of Borrowing – Money with Strings Attached', exact: true })).toBeVisible();
  expect(await saved(page)).toMatchObject({ sectionId: '32', capital: 2000, statChanges: { TA: -1 } });
  await expectNoHorizontalOverflow(page);

  await page.getByRole('button', { name: 'Character Sheet', exact: true }).first().click();
  const sheet = page.getByRole('dialog', { name: 'Character Sheet', exact: true });
  await expect(sheet).toBeVisible();
  await expect(sheet.getByRole('heading', { name: 'Born Closer', exact: true })).toBeVisible();
  await expect(sheet.getByRole('heading', { name: 'The Deal Maker', exact: true })).toBeVisible();
  await expect(sheet.getByText('$2,000', { exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(sheet).toBeHidden();
  await page.reload();
  await page.getByRole('button', { name: 'Continue Game', exact: true }).click();
  expect(await saved(page)).toMatchObject({ sectionId: '32', capital: 2000 });
  expect(errors).toEqual([]);
});

test('saves a declared prototype boundary and restarts with a fresh character only after confirmation', async ({ page }) => {
  await createEntrepreneur(page);
  const oldRunId = (await saved(page)).runId;
  await page.getByRole('button', { name: /Quit your job immediately and go all in/ }).click();
  await page.getByRole('button', { name: /Start building a website and brand identity right away/ }).click();
  await page.getByRole('button', { name: /Start posting on social media to attract attention/ }).click();
  await expect(page.getByRole('heading', { name: 'There’s more to your story.', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'There’s more to your story.', exact: true })).toBeFocused();
  await expect(page.getByText('section 16', { exact: true })).toBeVisible();
  expect(await saved(page)).toMatchObject({ phase: 'boundary', capital: 1000, boundary: { from: '5', target: '16' } });
  await expectNoHorizontalOverflow(page);

  await page.reload();
  await page.getByRole('button', { name: 'Continue Game', exact: true }).click();
  await expect(page.getByText('section 16', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Return to Menu', exact: true }).first().click();
  await page.getByRole('button', { name: 'New Game', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'A fresh start?', exact: true });
  await dialog.getByRole('button', { name: 'Keep my adventure', exact: true }).click();
  expect((await saved(page)).runId).toBe(oldRunId);
  await page.getByRole('button', { name: 'New Game', exact: true }).click();
  await dialog.getByRole('button', { name: 'New Game', exact: true }).click();
  const fresh = await saved(page);
  expect(fresh.runId).not.toBe(oldRunId);
  expect(fresh).toMatchObject({ phase: 'creation', capital: 1000, rolled: [], perkId: null, mentorId: null, powerUsed: false, pendingRoll: null });
});

test('preserves an unreadable save and provides an explicit recovery path', async ({ page }) => {
  await page.goto('/');
  const brokenSave = '{ this is not a valid saved game';
  await page.evaluate(({ key, raw }) => localStorage.setItem(key, raw), { key: SAVE_KEY, raw: brokenSave });
  await page.reload();
  await expect(page.getByRole('alert')).toContainText('save');
  await expect(page.getByRole('button', { name: 'Download existing save', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Continue Game', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'New Game', exact: true }).click();
  await page.getByRole('button', { name: 'Keep my adventure', exact: true }).click();
  expect(await page.evaluate((key) => localStorage.getItem(key), SAVE_KEY)).toBe(brokenSave);
});

test('supports keyboard-dismissable reading settings and persists them on reload', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Make yourself comfortable.', exact: true });
  await dialog.getByRole('button', { name: 'Larger text', exact: true }).click();
  await dialog.getByRole('checkbox', { name: /Reduce motion/ }).check();
  await expectNoHorizontalOverflow(page);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(page.getByRole('button', { name: 'Settings', exact: true })).toBeFocused();
  await page.reload();
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await expect(dialog.getByRole('button', { name: 'Larger text', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(dialog.getByRole('checkbox', { name: /Reduce motion/ })).toBeChecked();
});

async function useOnesForSubsequentDice(page: Page) {
  await page.evaluate(() => {
    const previous = crypto.getRandomValues.bind(crypto);
    Object.defineProperty(crypto, 'getRandomValues', {
      configurable: true,
      value(array: ArrayBufferView) {
        if (array instanceof Uint32Array && array.length === 1) {
          array[0] = 0;
          return array;
        }
        return previous(array);
      },
    });
  });
}

async function reachPendingPivotFailure(page: Page) {
  await useOnesForSubsequentDice(page);
  await page.getByRole('button', { name: /Quit your job immediately and go all in/ }).click();
  await page.getByRole('button', { name: /Go straight into selling something/ }).click();
  await page.getByRole('button', { name: 'Roll Dice', exact: true }).click();
  await expect(page.getByLabel('Roll total 5', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Continue Adventure', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'The Cold, Hard Silence – Facing the Crickets', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Roll Dice', exact: true }).click();
  await expect(page.getByLabel('Roll total 5', { exact: true })).toBeVisible();
  expect(await saved(page)).toMatchObject({ phase: 'roll-result', sectionId: '24', capital: 1000, powerUsed: false });
}

for (const scenario of [
  { mentor: 'The Bootstrapper', power: 'Shoestring Miracle', kind: 'reroll-loss', target: '85', capital: 1000 },
  { mentor: 'The Hustler', power: 'Grind It Out', kind: 'halve-loss', target: '85', capital: 500 },
  { mentor: 'The Deal Maker', power: 'The Big Play', kind: 'neutral-result', target: '84', capital: 1000 },
]) {
  test(`${scenario.mentor} optionally protects the original §24 failure and stays used after reload`, async ({ page }) => {
    await createEntrepreneur(page, scenario.mentor);
    await reachPendingPivotFailure(page);
    const power = page.getByRole('button', { name: `Use ${scenario.power}`, exact: true });
    await expect(power).toBeVisible();
    await power.click();
    const activated = await saved(page);
    expect(activated.powerUsed).toBe(true);
    expect(activated.pendingRoll.power).toBe(scenario.kind);
    expect(activated.capital).toBe(1000);
    await expect(power).toHaveCount(0);

    await page.reload();
    await page.getByRole('button', { name: 'Continue Game', exact: true }).click();
    expect((await saved(page)).pendingRoll).toEqual(activated.pendingRoll);
    await expect(power).toHaveCount(0);
    await page.getByRole('button', { name: 'Continue Adventure', exact: true }).click();
    expect(await saved(page)).toMatchObject({ phase: 'adventure', sectionId: scenario.target, capital: scenario.capital, powerUsed: true });
    await page.getByRole('button', { name: 'Character Sheet', exact: true }).first().click();
    await expect(page.getByRole('dialog', { name: 'Character Sheet' })).toContainText(`${scenario.power} · Used this act`);
  });
}

test('declining mentor protection applies the original §85 loss and preserves bankruptcy on reload', async ({ page }) => {
  await createEntrepreneur(page, 'The Hustler');
  await reachPendingPivotFailure(page);
  await expect(page.getByRole('button', { name: 'Use Grind It Out', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Continue Adventure', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Every ending is a beginning.', exact: true })).toBeVisible();
  expect(await saved(page)).toMatchObject({ phase: 'game-over', sectionId: '85', capital: 0, powerUsed: false });
  await expect(page.getByRole('button', { name: /Take a step back, validate your offer properly/ })).toHaveCount(0);
  await page.reload();
  await page.getByRole('button', { name: 'Continue Game', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Every ending is a beginning.', exact: true })).toBeVisible();
  expect(await saved(page)).toMatchObject({ phase: 'game-over', capital: 0 });
  await expect(page.getByRole('button', { name: 'Restart Adventure', exact: true })).toBeVisible();
});
