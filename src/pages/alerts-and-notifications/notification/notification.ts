import { Component } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { NotificationProvider, INotification } from '../../../providers/notification';
import { DevicePage } from '../../device/device';
import { RulesEditorPage } from '../../rules/rule-editor';

@Component({
    selector: 'page-notification',
    templateUrl: 'notification.html'
})
export class NotificationPage {

    public notification: INotification;

    constructor(public navCtrl: NavController,
                public notificationProvider: NotificationProvider,
                public params: NavParams,
                public notificationCtrl: AlertController) {

    }

    public removeNotification() {

        this.notificationCtrl.create({
            title: 'Remove this notification?',
            message: `Do you really want to remove this notification?`,
            buttons: [{
                text: 'Cancel',
                role: 'cancel'
            }, {
                text: 'Yes, remove',
                handler: () => {
                    this.notificationProvider.removeItem(this.params.get('id')).then(() => {

                        this.navCtrl.pop();

                    }).catch((err) => {
                        console.log(err);
                    });
                }
            }]
        }).present();
    }

    public goDevicePage(deviceId) {

        this.navCtrl.push(DevicePage, {id: deviceId});
    }

    public goRulePage(deviceId, ruleId) {

        this.navCtrl.push(RulesEditorPage, {deviceId, id: ruleId});
    }

    public ionViewDidEnter() {

        this.loadNotification();
    }

    private loadNotification() {

        this.notificationProvider.getItem(this.params.get('id')).then((notification: INotification) => {

            this.notification = notification;

        }).catch((err) => {
            console.log(err);
        });
    }
}
