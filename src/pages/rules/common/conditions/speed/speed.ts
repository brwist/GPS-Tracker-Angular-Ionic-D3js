import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { SpeedCondition } from '../../../../../app/conditions/speed';

@Component({
    selector: 'page-speed-condition',
    templateUrl: 'speed.html'
})
export class SpeedConditionPage {

    public condition: SpeedCondition;

    private callback: (condition: SpeedCondition) => void;

    constructor(public navCtrl: NavController,
                public params: NavParams) {

        this.callback  = this.params.get('callback');
        this.condition = this.params.get('condition');

        if (!this.condition) {

            this.condition = new SpeedCondition();
        }
    }

    public save() {

        this.callback(this.condition);

        this.navCtrl.pop();
    }
}
