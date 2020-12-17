import { Component } from '@angular/core';
import { DeviceProvider } from '../../../../providers/device';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { EmailNotification } from '../../../app/notifications/email';
import { EmailNotificationPage } from './common/notifications/email';
import { NotificationFactory, IAbstractNotification } from '../../../app/notifications/notification-factory';
import { PushNotificationPage } from './common/notifications/push';
import { WebPushNotification } from '../../../app/notifications/web-push';
import { WebPushNotificationPage } from './common/notifications/web-push';
import { SmsNotification } from '../../../app/notifications/sms';
import { SmsNotificationPage } from './common/notifications/sms';

@Component({
    selector: 'share-with-user',
    templateUrl: 'share-with-user.html'
})
export class ShareWithUserPage {

    public callback: (shareWith: any) => void;

    public shareWith: any = {
        firstName: '',
        email: ''
    };

    constructor(private navCtrl: NavController,
                private deviceProvider: DeviceProvider,
                private params: NavParams,
                private viewCtrl: ViewController) {

        this.callback = this.params.get('callback');
    }

    public share() {

        this.callback(this.shareWith);

        this.viewCtrl.dismiss();
    }

    public dismiss() {

        this.viewCtrl.dismiss();
    }
}
