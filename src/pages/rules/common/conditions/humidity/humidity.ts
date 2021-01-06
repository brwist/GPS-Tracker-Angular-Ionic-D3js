import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { HumidityCondition } from '../../../../../app/conditions/humidity';

@Component({
    selector: 'page-humidity-condition',
    templateUrl: 'humidity.html'
})
export class HumidityConditionPage {

    public condition: HumidityCondition;

    private callback: (condition: HumidityCondition) => void;

    constructor(public navCtrl: NavController,
                public params: NavParams) {

        this.callback  = this.params.get('callback');
        this.condition = this.params.get('condition');

        if (!this.condition) {

            this.condition = new HumidityCondition();
        }
    }

    public save() {

        this.callback(this.condition);

        this.navCtrl.pop();
    }
}
