import { Component } from '@angular/core';
import { DeviceProvider, IDevice } from '../../../providers/device';
import { NavController, NavParams } from 'ionic-angular';

@Component({
    selector: 'page-edit-device',
    templateUrl: 'edit-device.html'
})
export class EditDevicePage {

    public device: IDevice;

    constructor(public navCtrl: NavController,
                private deviceProvider: DeviceProvider,
                public params: NavParams) {

    }

    public save() {

        this.deviceProvider.updateItem(this.device).then((device: IDevice) => {

            this.navCtrl.pop();

        }).catch((err) => {
            console.log(err);
        });
    }

    public ionViewDidEnter() {

        this.loadDevice();
    }

    private loadDevice() {

        this.deviceProvider.getItem(this.params.get('id')).then((device) => {

            this.device = device;

        }).catch((err) => {
            console.log(err);
        });
    }
}
