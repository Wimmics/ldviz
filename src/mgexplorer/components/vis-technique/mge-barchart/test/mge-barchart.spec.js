import { newSpecPage } from '@stencil/core/testing';
import { MgeBarchart } from '../mge-barchart';
describe('mge-barchart', () => {
    it('renders', async () => {
        const page = await newSpecPage({
            components: [MgeBarchart],
            html: `<mge-barchart></mge-barchart>`,
        });
        expect(page.root).toEqualHtml(`
      <mge-barchart>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mge-barchart>
    `);
    });
});
