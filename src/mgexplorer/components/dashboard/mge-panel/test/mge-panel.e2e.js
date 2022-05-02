import { newE2EPage } from '@stencil/core/testing';
describe('mge-panel', () => {
    it('renders', async () => {
        const page = await newE2EPage();
        await page.setContent('<mge-panel></mge-panel>');
        const element = await page.find('mge-panel');
        expect(element).toHaveClass('hydrated');
    });
});
