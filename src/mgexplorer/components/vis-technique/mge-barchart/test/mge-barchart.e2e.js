import { newE2EPage } from '@stencil/core/testing';
describe('mge-barchart', () => {
    it('renders', async () => {
        const page = await newE2EPage();
        await page.setContent('<mge-barchart></mge-barchart>');
        const element = await page.find('mge-barchart');
        expect(element).toHaveClass('hydrated');
    });
});
