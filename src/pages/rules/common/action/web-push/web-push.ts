import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { WebPushAction } from '../../../../../app/actions/web-push';

@Component({
    selector: 'page-web-push-action',
    templateUrl: 'web-push.html'
})
export class WebPushActionPage {

    public action: WebPushAction;

    private callback: (action: WebPushAction) => void;

    private collectDurationUnit: string;

    constructor(public navCtrl: NavController,
                public params: NavParams) {

        this.callback = this.params.get('callback');
        this.action   = this.params.get('action');

        if (!this.action) {

            this.action = new WebPushAction();
        }

        this.collectDurationUnit = this.resolveCollectDurationUnit();
    }

    get collectDuration() {

        const collectDurationInUnit = this.getCollectDurationInUnit(this.action.collectDuration);

        this.collectDuration = collectDurationInUnit;

        return collectDurationInUnit;
    }

    set collectDuration(value) {

        this.action.collectDuration = this.getCollectDurationInSec(value);
    }

    public save() {

        if (this.collectDurationUnit === 'send-immediately') {

            this.action.collectDuration = 0;
        }

        this.callback(this.action);

        this.navCtrl.pop();
    }

    public getCollectDurationInUnit(collectDuration) {

        switch (this.collectDurationUnit) {
            case 'send-immediately':
                return 0;
            case 'Days':
                return Math.ceil(collectDuration / (24 * 60 * 60));
            case 'Hours':
                return Math.ceil(collectDuration / (60 * 60));
            case 'Minutes':
                return Math.ceil(collectDuration / 60);
            default:
                console.log(`getCollectDurationInUnit: Unexpected unit: "${this.collectDurationUnit}"`);
        }
    }

    private getCollectDurationInSec(collectDuration) {

        switch (this.collectDurationUnit) {
            case 'send-immediately':
                return 0;
            case 'Days':
                return Math.ceil(collectDuration * (24 * 60 * 60));
            case 'Hours':
                return Math.ceil(collectDuration * (60 * 60));
            case 'Minutes':
                return Math.ceil(collectDuration * 60);
            default:
                console.log(`getCollectDurationInSec: Unexpected unit: "${this.collectDurationUnit}"`);
        }
    }

    private resolveCollectDurationUnit() {

        if (this.action.collectDuration === 0) {

            return 'send-immediately';

        } else if (this.action.collectDuration % (24 * 60 * 60) === 0) {

            return 'Days';

        } else if (this.action.collectDuration % (60 * 60) === 0) {

            return 'Hours';

        } else {

            return 'Minutes';
        }
    }
}
