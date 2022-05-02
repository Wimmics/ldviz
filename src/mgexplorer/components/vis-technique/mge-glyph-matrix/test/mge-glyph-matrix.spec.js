import { newSpecPage } from '@stencil/core/testing';
import { MgeGlyphMatrix } from '../mge-glyph-matrix';
describe('mge-glyph-matrix', () => {
    it('renders', async () => {
        const page = await newSpecPage({
            components: [MgeGlyphMatrix],
            html: `<mge-glyph-matrix></mge-glyph-matrix>`,
        });
        expect(page.root).toEqualHtml(`
      <mge-glyph-matrix>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mge-glyph-matrix>
    `);
    });
});
