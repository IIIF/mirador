/* global miradorInstance */

describe('Window Sidebars', () => {
  beforeAll(async () => {
    await page.goto('http://127.0.0.1:4488/__tests__/integration/mirador/blank.html');

    await expect(page).toClick('#addBtn');
    await expect(page).toClick('.mirador-add-resource-button');
    await expect(page).toFill('#manifestURL', 'http://localhost:4488/__tests__/fixtures/version-2/001.json');
    await expect(page).toClick('#fetchBtn');

    await expect(page).toMatchElement('[data-manifestid="http://localhost:4488/__tests__/fixtures/version-2/001.json"] button');
    await expect(page).toClick('[data-manifestid="http://localhost:4488/__tests__/fixtures/version-2/001.json"] button');
  });

  it('renders and updates canvas level metadata', async () => {
    await expect(page).toMatchElement(
      'h2',
      { text: 'Bodleian Library Human Freaks 2 (33)' },
    );

    const windows = await page.evaluate(() => (
      miradorInstance.store.getState().windows
    ));

    const windowId = Object.values(windows)
      .find(window => window.manifestId === 'http://localhost:4488/__tests__/fixtures/version-2/001.json')
      .id;

    await expect(page).toMatchElement(`#${windowId} button[aria-label="Show sidebar"]`);
    await expect(page).toClick(`#${windowId} button[aria-label="Show sidebar"]`);

    await expect(page).toMatchElement(`#${windowId} button[aria-label="Information"]`);
  });

  it('renders canvas navigation and updates canvas after clicking a navigation item', async () => {
    const windows = await page.evaluate(() => (
      miradorInstance.store.getState().windows
    ));

    const windowId = Object.values(windows)
      .find(window => window.manifestId === 'http://localhost:4488/__tests__/fixtures/version-2/001.json')
      .id;

    await expect(page).toMatchElement(`#${windowId} button[aria-label="Show sidebar"]`);
    await expect(page).toClick(`#${windowId} button[aria-label="Show sidebar"]`);

    await expect(page).toMatchElement(`#${windowId} button[aria-label="Index"]`);
  });
});
