import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { BatteryCondition } from '../../../../../app/conditions/battery';

@Component({
    selector: 'page-battery-condition',
    templateUrl: 'battery.html'
})
export class BatteryConditionPage {

    public condition: BatteryCondition;

    private callback: (condition: BatteryCondition) => void;

    constructor(public navCtrl: NavController,
                public params: NavParams) {

        this.callback  = this.params.get('callback');
        this.condition = this.params.get('condition');

        if (!this.condition) {

            this.condition = new BatteryCondition();
        }
    }

    public save() {

        this.callback(this.condition);

        this.navCtrl.pop();
    }
}
