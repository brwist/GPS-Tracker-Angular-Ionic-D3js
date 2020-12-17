import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { SmsNotification } from '../../../../../../app/notifications/sms';
import { Rule, RuleProvider } from '../../../../providers/rule';

@Component({
    selector: 'page-sms-notification',
    templateUrl: 'sms.html'
})
export class SmsNotificationPage {

    public notification: SmsNotification;

    private callback: (notification: SmsNotification) => void;

    constructor(public navCtrl: NavController,
                public params: NavParams) {

        this.callback     = this.params.get('callback');
        this.notification = this.params.get('notification');

        if (!this.notification) {

            this.notification = new SmsNotification();
        }
    }

    public save() {

        this.callback(this.notification);

        this.navCtrl.pop();
    }
}
