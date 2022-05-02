import { newE2EPage } from '@stencil/core/testing';

describe('mge-view', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<mge-view></mge-view>');

    const element = await page.find('mge-view');
    expect(element).toHaveClass('hydrated');
  });
});
