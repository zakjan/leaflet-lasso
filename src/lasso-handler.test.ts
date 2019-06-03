import L from 'leaflet';
import { LassoHandler, ENABLED_EVENT, DISABLED_EVENT, FINISHED_EVENT, ACTIVE_CLASS } from './lasso-handler';

describe('LassoHandler', () => {
    let container: HTMLElement;
    let map: L.Map;
    let lasso: LassoHandler;
    
    beforeEach(() => {
        container = document.createElement('div');
        container.style.width = '400px';
        container.style.height = '400px';

        map = L.map(container, { renderer: new L.SVG(), center: [0, 0], zoom: 12, maxZoom: 12 });
        lasso = new LassoHandler(map);
    });
    
    it('fires enabled event', () => {
        const spy = jest.fn();
        map.on(ENABLED_EVENT, spy);

        lasso.enable();
        expect(spy).toHaveBeenCalled();
    });
    
    it('fires disabled event', () => {
        const spy = jest.fn();
        map.on(DISABLED_EVENT, spy);

        lasso.enable();
        lasso.disable();
        expect(spy).toHaveBeenCalled();
    });
    
    it('fires finished event', () => {
        const marker = L.marker([-0.1, 0.1]).addTo(map);
        L.marker([50, 50]).addTo(map);
        const spy = jest.fn();
        map.on(FINISHED_EVENT, spy);

        lasso.enable();
        container.dispatchEvent(new MouseEvent('mousedown', { buttons: 1, clientX: 0, clientY: 0 }));
        document.dispatchEvent(new MouseEvent('mousemove', { buttons: 1, clientX: 400, clientY: 0 }));
        document.dispatchEvent(new MouseEvent('mousemove', { buttons: 1, clientX: 400, clientY: 400 }));
        document.dispatchEvent(new MouseEvent('mousemove', { buttons: 1, clientX: 0, clientY: 400 }));
        document.dispatchEvent(new MouseEvent('mouseup', { buttons: 1, clientX: 0, clientY: 400 }));
        expect(spy).toHaveBeenCalledWith(expect.objectContaining({
            layers: [marker],
        }));
    });

    it('adds active class to map container', () => {
        lasso.enable();

        expect(container.classList.contains(ACTIVE_CLASS)).toEqual(true);
    });

    it('adds active class to document', () => {
        lasso.enable();
        container.dispatchEvent(new MouseEvent('mousedown', { buttons: 1, clientX: 0, clientY: 0 }));
        expect(document.body.classList.contains(ACTIVE_CLASS)).toEqual(true);
    });

    it('removes active class', () => {
        lasso.enable();
        container.dispatchEvent(new MouseEvent('mousedown', { buttons: 1, clientX: 0, clientY: 0 }));
        document.dispatchEvent(new MouseEvent('mouseup', { buttons: 1, clientX: 0, clientY: 0 }));
        expect(container.classList.contains(ACTIVE_CLASS)).toEqual(false);
        expect(document.body.classList.contains(ACTIVE_CLASS)).toEqual(false);
    });

    it('disables after finishing', () => {
        lasso.enable();
        container.dispatchEvent(new MouseEvent('mousedown', { buttons: 1, clientX: 0, clientY: 0 }));
        document.dispatchEvent(new MouseEvent('mouseup', { buttons: 1, clientX: 0, clientY: 0 }));
        expect(lasso.enabled()).toEqual(false);
    });
})
