import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { LoCCondition } from '../../../../../app/conditions/loc';

@Component({
    selector: 'page-loc-condition',
    templateUrl: 'loc.html'
})
export class LoCConditionPage {

    public condition: LoCCondition;

    private callback: (condition: LoCCondition) => void;

    constructor(public navCtrl: NavController,
        public params: NavParams) {

        this.callback = this.params.get('callback');
        this.condition = this.params.get('condition');

        if (!this.condition) {

            this.condition = new LoCCondition();
        }
    }

    public save() {

        this.callback(this.condition);

        this.navCtrl.pop();
    }
}
