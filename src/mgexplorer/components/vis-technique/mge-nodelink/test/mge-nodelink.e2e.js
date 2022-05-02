import { newE2EPage } from '@stencil/core/testing';
describe('mge-nodelink', () => {
    it('renders', async () => {
        const page = await newE2EPage();
        await page.setContent('<mge-nodelink></mge-nodelink>');
        const element = await page.find('mge-nodelink');
        expect(element).toHaveClass('hydrated');
    });
});
