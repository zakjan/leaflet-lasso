import L from 'leaflet';
import { LassoControl } from './lasso-control';

describe('LassoControl', () => {
    let container: HTMLElement;
    let map: L.Map;
    let lasso: LassoControl;
    
	beforeEach(() => {
        container = document.createElement('div');
        container.style.width = '400px';
        container.style.height = '400px';

        map = L.map(container, { renderer: new L.SVG(), center: [0, 0], zoom: 12 });
        lasso = new LassoControl().addTo(map);
    });

    it('toggles handler', () => {
        const button = container.querySelector('.leaflet-control-lasso') as HTMLElement;

        button.click();
        expect(lasso.enabled()).toBe(true);

        button.click();
        expect(lasso.enabled()).toBe(false);
    });
});