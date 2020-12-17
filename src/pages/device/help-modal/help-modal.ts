import {Component, OnInit} from '@angular/core';
import {NavParams, ViewController} from 'ionic-angular';

@Component({
    selector: 'help-modal',
    templateUrl: 'help-modal.html'
})
export class HelpModal implements OnInit {

    public feature: string;

    constructor(private viewCtrl: ViewController,
                private params: NavParams) {

    }

    public ngOnInit() {

        this.feature = this.params.get('feature');
    }

    public dismiss() {

        this.viewCtrl.dismiss();
    }
}
