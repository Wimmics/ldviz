import { newSpecPage } from '@stencil/core/testing';
import { MgeHeader } from '../mge-header';

describe('mge-header', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MgeHeader],
      html: `<mge-header></mge-header>`,
    });
    expect(page.root).toEqualHtml(`
      <mge-header>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mge-header>
    `);
  });
});
