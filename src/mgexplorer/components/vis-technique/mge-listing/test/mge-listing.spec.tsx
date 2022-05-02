import { newSpecPage } from '@stencil/core/testing';
import { MgeListing } from '../mge-listing';

describe('mge-listing', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MgeListing],
      html: `<mge-listing></mge-listing>`,
    });
    expect(page.root).toEqualHtml(`
      <mge-listing>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mge-listing>
    `);
  });
});
