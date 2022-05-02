import { newE2EPage } from '@stencil/core/testing';

describe('mge-iris', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<mge-iris></mge-iris>');

    const element = await page.find('mge-iris');
    expect(element).toHaveClass('hydrated');
  });
});
