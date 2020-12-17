import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { VoltsCondition } from '../../../../../app/conditions/volts';

@Component({
    selector: 'page-volts-condition',
    templateUrl: 'volts.html'
})
export class VoltsConditionPage {

    public condition: VoltsCondition;

    private callback: (condition: VoltsCondition) => void;

    constructor(public navCtrl: NavController,
                public params: NavParams) {

        this.callback  = this.params.get('callback');
        this.condition = this.params.get('condition');

        if (!this.condition) {

            this.condition = new VoltsCondition();
        }
    }

    public save() {

        this.callback(this.condition);

        this.navCtrl.pop();
    }
}
