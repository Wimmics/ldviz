import { newE2EPage } from '@stencil/core/testing';
describe('mge-dashboard', () => {
    it('renders', async () => {
        const page = await newE2EPage();
        await page.setContent('<mge-dashboard></mge-dashboard>');
        const element = await page.find('mge-dashboard');
        expect(element).toHaveClass('hydrated');
    });
});
