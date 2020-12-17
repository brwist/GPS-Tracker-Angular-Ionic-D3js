import { Component, OnInit, ViewChild } from '@angular/core';
import { DeviceProvider, IDevice } from '../../../providers/device';
import { NavController, AlertController, NavParams } from 'ionic-angular';
import { TrakkitProvider, TRAKKIT_MAC_KEY } from '../../../providers/trakkit';
import { Storage } from '@ionic/storage';

@Component({
    selector: 'page-create-device',
    templateUrl: 'create-device.html'
})
export class CreateDevicePage implements OnInit {
    @ViewChild('nameInput') public nameInput;

    public device: IDevice = {
        name: 'New device'
    };

    private refreshCallback: () => void;

    constructor(
        private navCtrl: NavController,
        private deviceProvider: DeviceProvider,
        private navParams: NavParams,
        private alertCtrl: AlertController,
        private storage: Storage
    ) {

    }

    public async ngOnInit() {

        if (!this.device.mac) {
            try {
                const mac = await this.storage.get(TRAKKIT_MAC_KEY);
                this.device.mac = mac;
            } catch (error) {
                //
                console.info(error);
            }
        }

        this.refreshCallback = this.navParams.get('refreshCallback');
    }

    public ionViewDidEnter() {
        setTimeout(() => {
            this.nameInput.setFocus();
        }, 400);
    }

    public add() {

        if (!this.device.name) {

            this.alertCtrl.create({
                title: 'Name is required',
                buttons: [{
                    text: 'Ok'
                }]
            }).present();

            return;
        }

        if (!this.device.mac) {

            this.alertCtrl.create({
                title: 'MAC address is required',
                buttons: [{
                    text: 'Ok'
                }]
            }).present();

            return;
        }

        if (!TrakkitProvider.isValidMAC(this.device.mac)) {

            this.alertCtrl.create({
                title: 'MAC address is invalid',
                buttons: [{
                    text: 'Ok'
                }]
            }).present();

            return;
        }

        this.deviceProvider.addItem(this.device).then((device: IDevice) => {

            this.storage.remove(TRAKKIT_MAC_KEY).then((x) => {
                this.refreshCallback();

                this.navCtrl.pop();
            });

        }).catch((err) => {
            console.log(err);
        });
    }
}
