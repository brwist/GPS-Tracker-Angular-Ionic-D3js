import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { ReeferHoursCondition } from '../../../../../app/conditions/reefer-hours';

@Component({
    selector: 'page-reefer-hours-condition',
    templateUrl: 'reefer-hours.html'
})
export class ReeferHoursConditionPage {

    public condition: ReeferHoursCondition;

    private callback: (condition: ReeferHoursCondition) => void;

    constructor(public navCtrl: NavController,
                public params: NavParams) {

        this.callback  = this.params.get('callback');
        this.condition = this.params.get('condition');

        if (!this.condition) {

            this.condition = new ReeferHoursCondition();
        }
    }

    public save() {

        this.callback(this.condition);

        this.navCtrl.pop();
    }
}
