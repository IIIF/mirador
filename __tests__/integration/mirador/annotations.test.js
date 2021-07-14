/* global miradorInstance */

describe('Annotations in Mirador', () => {
  beforeAll(async () => {
    await page.goto('http://127.0.0.1:4488/__tests__/integration/mirador/');
    await expect(page).toMatchElement('.mirador-window[aria-label="Window: Self-Portrait Dedicated to Paul Gauguin"]', { polling: 'mutation', timeout: 5000 });
  });
  it('stores annotations in state by canvasId', async () => {
    const annotations = await page.evaluate(() => (
      miradorInstance.store.getState().annotations
    ));
    await expect(Object.keys(annotations).length).toEqual(1);
  });

  // Note that this test is tied to a specific record showing up by default (299843.json)
  it('renders annotation in a companion window/sidebar panel', async () => {
    const windowId = await page.evaluate(() => {
      const { windows } = miradorInstance.store.getState();

      return Object.values(windows)
        .find(w => w.manifestId === 'https://iiif.harvardartmuseums.org/manifests/object/299843').id;
    });

    await expect(page).toClick(`#${windowId} button[aria-label="Show sidebar"]`);
    await expect(page).toClick(`#${windowId} button[aria-label="Annotations"]`);

    await expect(page).toMatchElement(`#${windowId} h3`, { text: 'Annotations' });
    await expect(page).toMatchElement(`#${windowId} p`, { polling: 'mutation', text: 'Showing 5 annotations', timeout: 2000 });
    await expect(page).toMatchElement(`#${windowId} .mirador-companion-window-left.mirador-window-sidebar-annotation-panel ul li`, { count: 2 });
  });
});
