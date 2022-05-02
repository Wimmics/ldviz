import { newSpecPage } from '@stencil/core/testing';
import { MgeDashboard } from '../mge-dashboard';
describe('mge-dashboard', () => {
    it('renders', async () => {
        const page = await newSpecPage({
            components: [MgeDashboard],
            html: `<mge-dashboard></mge-dashboard>`,
        });
        expect(page.root).toEqualHtml(`
      <mge-dashboard>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mge-dashboard>
    `);
    });
});
