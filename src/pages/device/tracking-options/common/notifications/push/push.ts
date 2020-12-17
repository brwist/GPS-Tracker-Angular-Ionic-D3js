import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { PushNotification } from '../../../../../../app/notifications/push';
import { Rule, RuleProvider } from '../../../../providers/rule';

@Component({
    selector: 'page-push-notification',
    templateUrl: 'push.html'
})
export class PushNotificationPage {

    public notification: PushNotification;

    private callback: (notification: PushNotification) => void;

    constructor(public navCtrl: NavController,
                public params: NavParams) {

        this.callback     = this.params.get('callback');
        this.notification = this.params.get('notification');

        if (!this.notification) {

            this.notification = new PushNotification();
        }
    }

    public save() {

        this.callback(this.notification);

        this.navCtrl.pop();
    }
}
