import { newSpecPage } from '@stencil/core/testing';
import { MgeClustervis } from '../mge-clustervis';

describe('mge-clustervis', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MgeClustervis],
      html: `<mge-clustervis></mge-clustervis>`,
    });
    expect(page.root).toEqualHtml(`
      <mge-clustervis>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mge-clustervis>
    `);
  });
});
