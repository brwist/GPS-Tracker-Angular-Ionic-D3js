import { Component } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { AlertProvider, IAlert } from '../../../providers/alert';
import { DevicePage } from '../../device/device';
import { RulesEditorPage } from '../../rules/rule-editor';

@Component({
    selector: 'page-alert',
    templateUrl: 'alert.html'
})
export class AlertPage {

    public alert: IAlert;

    constructor(public navCtrl: NavController,
                public alertProvider: AlertProvider,
                public params: NavParams,
                public alertCtrl: AlertController) {

    }

    public removeAlert() {

        this.alertCtrl.create({
            title: 'Remove this alert?',
            message: `Do you really want to remove this alert?`,
            buttons: [{
                text: 'Cancel',
                role: 'cancel'
            }, {
                text: 'Yes, remove',
                handler: () => {
                    this.alertProvider.removeItem(this.params.get('id')).then(() => {

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

        console.log(`deviceId: ${deviceId}, ruleId: ${ruleId}`);

        this.navCtrl.push(RulesEditorPage, {deviceId, id: ruleId});
    }

    public ionViewDidEnter() {

        this.loadAlert();
    }

    private loadAlert() {

        this.alertProvider.getItem(this.params.get('id')).then((alert: IAlert) => {

            this.alert = alert;

        }).catch((err) => {
            console.log(err);
        });
    }
}
