import L from 'leaflet';
import { LassoHandler, LassoHandlerOptions } from './lasso-handler';
import './lasso-control.css';

export type LassoControlOptions = LassoHandlerOptions & L.ControlOptions;

export class LassoControl extends L.Control {
    options: LassoControlOptions = {
        position: 'topright',
        title: 'Toggle Lasso',
        mobileMsg: 'Click the Button to finish' //Empty to disable
    };

    button?: HTMLElement;

    private lasso?: LassoHandler;

    constructor(options: LassoControlOptions = {}) {
        super();

        L.Util.setOptions(this, options);
    }

    setOptions(options: LassoControlOptions) {
        this.options = { ...this.options, ...options };
        
        if (this.lasso) {
            this.lasso.setOptions(this.options);
        }
    }

    onAdd(map: L.Map) {
        this.lasso = new LassoHandler(map, this.options);

        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control') as HTMLDivElement;
        const button = L.DomUtil.create('a', 'leaflet-control-lasso', container) as HTMLAnchorElement;

        //button.href = '#'; //Mobile Device is jumping
        button.id = 'lasso-control';
        button.title = this.options.title || 'Toggle Lasso';
        button.setAttribute('role', 'button');
        button.setAttribute('aria-label', button.title);
        this.button = button;

        let side_box = 'lasso-box-right';
        let side_msg = 'lasso-control-msg-right';
        if(this.options.position && this.options.position.indexOf('left') > -1){
            side_box = 'lasso-box-left';
            side_msg = 'lasso-control-msg-left';
        }

        const msg_container = L.DomUtil.create('div', side_box, container) as HTMLDivElement;
        msg_container.id = 'lasso-control-msg-box';

        const msg_button = L.DomUtil.create('a', side_msg, msg_container) as HTMLAnchorElement;
        msg_button.id = "lasso-control-msg-a";
        msg_button.innerHTML = "This ist a Msg";

        L.DomEvent.addListener(button, 'click', this.toggle, this);
        L.DomEvent.disableClickPropagation(button);
        return container;
    }

    enabled() {
        if (!this.lasso) {
            return false;
        }
        return this.lasso.enabled();
    }

    enable() {
        if (!this.lasso) {
            return;
        }
        this.lasso.enable();
    }

    disable() {
        if (!this.lasso) {
            return;
        }
        this.lasso.disable();
    }

    toggle() {
        if (!this.lasso) {
            return;
        }
        this.lasso.toggle();
    }

    showMsg(text: string){
        var btn = L.DomUtil.get('lasso-control-msg-a');
        var div = L.DomUtil.get('lasso-control-msg-box');
        if(btn && div) {
            btn.innerHTML = text;
            L.DomUtil.addClass(div,'showBox');
        }
    }

    hideMsg(){
        var div = L.DomUtil.get('lasso-control-msg-box');
        if(div) {
            L.DomUtil.removeClass(div,'showBox');
        }
    }
}
