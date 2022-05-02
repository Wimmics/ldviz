import { newE2EPage } from '@stencil/core/testing';

describe('mge-glyph-matrix', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<mge-glyph-matrix></mge-glyph-matrix>');

    const element = await page.find('mge-glyph-matrix');
    expect(element).toHaveClass('hydrated');
  });
});
