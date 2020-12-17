import { Component, OnInit } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';

@Component({
    selector: 'rules-popover-page',
    templateUrl: 'popover.html'
})
export class RulesPopoverPage implements OnInit {

    private newRuleCallback: () => void;

    constructor(private viewCtrl: ViewController,
                private navParams: NavParams) {

    }

    public ngOnInit() {

        this.newRuleCallback = this.navParams.get('newRuleCallback');
    }

    public newRule() {

        this.newRuleCallback();

        this.viewCtrl.dismiss();
    }
}
