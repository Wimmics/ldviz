import { newSpecPage } from '@stencil/core/testing';
import { MgeIris } from '../mge-iris';

describe('mge-iris', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MgeIris],
      html: `<mge-iris></mge-iris>`,
    });
    expect(page.root).toEqualHtml(`
      <mge-iris>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mge-iris>
    `);
  });
});
