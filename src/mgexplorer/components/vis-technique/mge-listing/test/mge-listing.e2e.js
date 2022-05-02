import { newE2EPage } from '@stencil/core/testing';
describe('mge-listing', () => {
    it('renders', async () => {
        const page = await newE2EPage();
        await page.setContent('<mge-listing></mge-listing>');
        const element = await page.find('mge-listing');
        expect(element).toHaveClass('hydrated');
    });
});
