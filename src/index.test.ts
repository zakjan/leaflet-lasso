import * as L from 'leaflet';
import { LassoHandler, LassoControl } from './index';
import './index';

describe('index', () => {
    let container: HTMLElement;
    let map: L.Map;
    
    beforeEach(() => {
        container = document.createElement('div');
        container.style.width = '400px';
        container.style.height = '400px';

        map = L.map(container, { renderer: new L.SVG(), center: [0, 0], zoom: 12 });
    });

    it('exports LassoHandler', () => {
        const lassoHandler = new LassoHandler(map);
        expect(lassoHandler).toBeInstanceOf(LassoHandler);
    });

    it('exports L.Lasso', () => {
        const lassoHandler = new L.Lasso(map);
        expect(lassoHandler).toBeInstanceOf(LassoHandler);
    });

    it('exports L.lasso', () => {
        const lassoHandler = L.lasso(map);
        expect(lassoHandler).toBeInstanceOf(LassoHandler);
    });

    it('exports LassoControl', () => {
        const lassoControl = new LassoControl().addTo(map);
        expect(lassoControl).toBeInstanceOf(LassoControl);
    });

    it('exports L.Control.Lasso', () => {
        const lassoControl = new L.Control.Lasso().addTo(map);
        expect(lassoControl).toBeInstanceOf(LassoControl);
    });

    it('exports L.control.lasso', () => {
        const lassoControl = L.control.lasso().addTo(map);
        expect(lassoControl).toBeInstanceOf(LassoControl);
    });
});
