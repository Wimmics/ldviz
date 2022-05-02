import { newSpecPage } from '@stencil/core/testing';
import { MgePanel } from '../mge-panel';

describe('mge-panel', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MgePanel],
      html: `<mge-panel></mge-panel>`,
    });
    expect(page.root).toEqualHtml(`
      <mge-panel>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mge-panel>
    `);
  });
});
