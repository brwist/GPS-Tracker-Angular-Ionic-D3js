import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { EmailNotification } from '../../../../../../app/notifications/email';
import { Rule, RuleProvider } from '../../../../providers/rule';

@Component({
    selector: 'page-email-notification',
    templateUrl: 'email.html'
})
export class EmailNotificationPage {

    public notification: EmailNotification;

    private callback: (notification: EmailNotification) => void;

    constructor(public navCtrl: NavController,
                public params: NavParams) {

        this.callback     = this.params.get('callback');
        this.notification = this.params.get('notification');

        if (!this.notification) {

            this.notification = new EmailNotification();
        }
    }

    public save() {

        this.callback(this.notification);

        this.navCtrl.pop();
    }
}
