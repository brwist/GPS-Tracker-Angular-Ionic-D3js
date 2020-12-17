import { Component } from '@angular/core';
import { DeviceProvider, IDevice, ITrackingOptions } from '../../../providers/device';
import { NavController, NavParams, ViewController, AlertController, ItemSliding } from 'ionic-angular';
import { EmailNotification } from '../../../app/notifications/email';
import { EmailNotificationPage } from './common/notifications/email';
import { NotificationFactory, IAbstractNotification } from '../../../app/notifications/notification-factory';
import { PushNotification } from '../../../app/notifications/push';
import { PushNotificationPage } from './common/notifications/push';
import { WebPushNotification } from '../../../app/notifications/web-push';
import { WebPushNotificationPage } from './common/notifications/web-push';
import { SmsNotification } from '../../../app/notifications/sms';
import { SmsNotificationPage } from './common/notifications/sms';

@Component({
    selector: 'tracking-options',
    templateUrl: 'tracking-options.html'
})
export class TrackingOptionsPage {

    public device: IDevice;
    public trackingOptions: ITrackingOptions;

    public notifications: IAbstractNotification[] = [];

    public pushed: boolean;

    constructor(public navCtrl: NavController,
                private deviceProvider: DeviceProvider,
                private params: NavParams,
                private viewCtrl: ViewController,
                private alertCtrl: AlertController) {

    }

    public ngOnInit() {

        this.pushed = !!this.params.get('pushed');

        this.deviceProvider.getItem(this.params.get('id')).then((device) => {

            this.device          = device;
            this.trackingOptions = this.device.trackingOptions;
            this.notifications   = this.trackingOptions.notifications;

            this.notifications = this.trackingOptions.notifications.map((notificationData) => {

                return NotificationFactory.createNotification(notificationData);
            });

        }).catch((err) => {
            console.log(err);
        });
    }

    public save() {

        this.trackingOptions.notifications = this.notifications;

        this.deviceProvider.applyAction(this.device.id, 'set-tracking-options', this.trackingOptions).then(() => {

            if (this.pushed) {

                this.navCtrl.pop();

            } else {

                this.viewCtrl.dismiss();
            }

        }).catch((err) => {
            console.log(err);
        });
    }

    public addNotification() {

        const alert = this.alertCtrl.create();

        alert.setTitle('Add new notification');

        alert.addButton({
            text: 'Email',
            handler: (data) => {
                this.navCtrl.push(EmailNotificationPage, {
                    callback: (notification: EmailNotification) => {
                        this.notifications.push(notification);
                    }
                });
            }
        });

        // Hide for now
        // alert.addButton({
        //     text: 'SMS',
        //     handler: (data) => {
        //         this.navCtrl.push(SmsNotificationPage, {
        //             callback: (notification: SmsNotification) => {
        //                 this.notifications.push(notification);
        //             }
        //         });
        //     }
        // });

        alert.addButton({
            text: 'PUSH',
            handler: (data) => {
                this.navCtrl.push(PushNotificationPage, {
                    callback: (notification: PushNotification) => {
                        console.log('PushNotification');
                        console.log(notification);
                        this.notifications.push(notification);
                    }
                });
            }
        });

        alert.addButton({
            text: 'WEB PUSH',
            handler: (data) => {
                this.navCtrl.push(WebPushNotificationPage, {
                    callback: (notification: WebPushNotification) => {
                        this.notifications.push(notification);
                    }
                });
            }
        });

        alert.addButton('Cancel');

        alert.present();

    }

    public goEditNotificationPage(notification) {

        switch (notification.notificationType) {
            case 'push':
                this.navCtrl.push(PushNotificationPage, {
                    notification,
                    callback: (act: PushNotification) => {
                        this.doUpdateNotification(act);
                    }
                });
                break;
            case 'web-push':
                this.navCtrl.push(WebPushNotificationPage, {
                    notification,
                    callback: (act: WebPushNotification) => {
                        this.doUpdateNotification(act);
                    }
                });
                break;
            case 'sms':
                this.navCtrl.push(SmsNotificationPage, {
                    notification,
                    callback: (act: SmsNotification) => {
                        this.doUpdateNotification(act);
                    }
                });
                break;
            case 'email':
                this.navCtrl.push(EmailNotificationPage, {
                    notification,
                    callback: (act: EmailNotification) => {
                        this.doUpdateNotification(act);
                    }
                });
                break;
            default:
                console.log(`Unexpected notification type "${notification.notificationType}"`);
        }
    }

    public enableNotification(notification, slidingItem: ItemSliding) {

        this.notifications = this.notifications.map((not) => {
            if (not.uid === notification.uid) {
                not.enabled = true;
            }

            return not;
        });

        slidingItem.close();
    }

    public disableNotification(notification, slidingItem: ItemSliding) {

        this.notifications = this.notifications.map((not) => {
            if (not.uid === notification.uid) {
                not.enabled = false;
            }

            return not;
        });

        slidingItem.close();
    }

    public removeNotification(notification) {

        this.notifications = this.notifications.filter((not) => not.uid !== notification.uid);
    }

    public dismiss() {

        this.viewCtrl.dismiss();
    }

    private doUpdateNotification(notification) {

        this.notifications = this.notifications.map((not) => {
            if (not.uid === notification.uid) {
                return notification;
            }
            return not;
        });
    }
}
