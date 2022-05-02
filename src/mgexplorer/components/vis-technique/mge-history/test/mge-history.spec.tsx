import { newSpecPage } from '@stencil/core/testing';
import { MgeHistory } from '../mge-history';

describe('mge-history', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MgeHistory],
      html: `<mge-history></mge-history>`,
    });
    expect(page.root).toEqualHtml(`
      <mge-history>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mge-history>
    `);
  });
});
