import { newE2EPage } from '@stencil/core/testing';
describe('mge-header', () => {
    it('renders', async () => {
        const page = await newE2EPage();
        await page.setContent('<mge-header></mge-header>');
        const element = await page.find('mge-header');
        expect(element).toHaveClass('hydrated');
    });
});
