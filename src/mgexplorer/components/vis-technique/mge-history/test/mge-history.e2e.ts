import { newE2EPage } from '@stencil/core/testing';

describe('mge-history', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<mge-history></mge-history>');

    const element = await page.find('mge-history');
    expect(element).toHaveClass('hydrated');
  });
});
