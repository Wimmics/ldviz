import { newE2EPage } from '@stencil/core/testing';
describe('mge-clustervis', () => {
    it('renders', async () => {
        const page = await newE2EPage();
        await page.setContent('<mge-clustervis></mge-clustervis>');
        const element = await page.find('mge-clustervis');
        expect(element).toHaveClass('hydrated');
    });
});
