import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { NTC1Condition } from '../../../../../app/conditions/ntc1';

@Component({
    selector: 'page-ntc1-condition',
    templateUrl: 'ntc1.html'
})
export class NTC1ConditionPage {

    public condition: NTC1Condition;

    private callback: (condition: NTC1Condition) => void;

    constructor(public navCtrl: NavController,
                public params: NavParams) {

        this.callback  = this.params.get('callback');
        this.condition = this.params.get('condition');

        if (!this.condition) {

            this.condition = new NTC1Condition();
        }
    }

    public save() {

        this.callback(this.condition);

        this.navCtrl.pop();
    }
}
