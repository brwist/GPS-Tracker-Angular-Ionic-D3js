import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { TemperatureCondition } from '../../../../../app/conditions/temperature';

@Component({
    selector: 'page-temperature-condition',
    templateUrl: 'temperature.html'
})
export class TemperatureConditionPage {

    public condition: TemperatureCondition;

    private callback: (condition: TemperatureCondition) => void;

    constructor(public navCtrl: NavController,
                public params: NavParams) {

        this.callback  = this.params.get('callback');
        this.condition = this.params.get('condition');

        if (!this.condition) {

            this.condition = new TemperatureCondition();
        }
    }

    public save() {

        this.callback(this.condition);

        this.navCtrl.pop();
    }
}
