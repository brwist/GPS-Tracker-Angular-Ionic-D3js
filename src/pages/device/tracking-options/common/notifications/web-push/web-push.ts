import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { WebPushAction } from '../../../../../../app/actions/web-push';
import { Rule, RuleProvider } from '../../../../providers/rule';

@Component({
    selector: 'page-web-push-notification',
    templateUrl: 'web-push.html'
})
export class WebPushNotificationPage {

    public notification: WebPushAction;

    private callback: (notification: WebPushAction) => void;

    constructor(public navCtrl: NavController,
                public params: NavParams) {

        this.callback     = this.params.get('callback');
        this.notification = this.params.get('notification');

        if (!this.notification) {

            this.notification = new WebPushAction();
        }
    }

    public save() {

        this.callback(this.notification);

        this.navCtrl.pop();
    }
}
