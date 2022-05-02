import { newSpecPage } from '@stencil/core/testing';
import { MgeQuery } from '../mge-query';

describe('mge-query', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MgeQuery],
      html: `<mge-query></mge-query>`,
    });
    expect(page.root).toEqualHtml(`
      <mge-query>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mge-query>
    `);
  });
});
