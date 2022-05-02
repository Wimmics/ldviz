import { newE2EPage } from '@stencil/core/testing';

describe('mge-query', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<mge-query></mge-query>');

    const element = await page.find('mge-query');
    expect(element).toHaveClass('hydrated');
  });
});
