import { newSpecPage } from '@stencil/core/testing';
import { MgeView } from '../mge-view';

describe('mge-view', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MgeView],
      html: `<mge-view></mge-view>`,
    });
    expect(page.root).toEqualHtml(`
      <mge-view>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mge-view>
    `);
  });
});
