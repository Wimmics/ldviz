import { newSpecPage } from '@stencil/core/testing';
import { MgeNodelink } from '../mge-nodelink';

describe('mge-nodelink', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MgeNodelink],
      html: `<mge-nodelink></mge-nodelink>`,
    });
    expect(page.root).toEqualHtml(`
      <mge-nodelink>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mge-nodelink>
    `);
  });
});
