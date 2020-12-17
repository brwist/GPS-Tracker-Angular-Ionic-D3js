import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { SmsAction } from '../../../../../app/actions/sms';

@Component({
    selector: 'page-sms-action',
    templateUrl: 'sms.html'
})
export class SmsActionPage {

    public action: SmsAction;

    public phones: string[] = [];

    private callback: (action: SmsAction) => void;

    private collectDurationUnit: string;

    constructor(private navCtrl: NavController,
                private params: NavParams) {

        this.callback = this.params.get('callback');
        this.action   = this.params.get('action');
        this.phones   = this.params.get('phones');

        if (!this.action) {

            this.action = new SmsAction();
        }

        if (!this.action.data.phone && this.phones.length > 0) {

            this.action.data.phone = this.phones[0];
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
