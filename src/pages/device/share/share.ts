import { Component } from '@angular/core';
import { AlertPage } from '../alert/alert';
import { LoadingController, NavParams, NavController, ModalController, ItemSliding } from 'ionic-angular';
import { AlertsPopoverPage } from './popover';
import { Logger } from '../../../providers/logger';
import { DeviceProvider, IDevice, ISharedWith } from '../../../providers/device';
import { TrackPage } from './track';
import { Storage } from '@ionic/storage';
import { ShareWithUserPage } from './share-with-user';

@Component({
    selector: 'page-share',
    templateUrl: 'share.html'
})
export class DeviceSharePage {

    public device: IDevice;

    constructor(private logger: Logger,
                private params: NavParams,
                private loadingCtrl: LoadingController,
                private navCtrl: NavController,
                private storage: Storage,
                private modalCtrl: ModalController,
                private deviceProvider: DeviceProvider) {

        this.device = this.params.get('device');
    }

    public openShareWithUserPage() {

        this.modalCtrl.create(ShareWithUserPage, {
            callback: (shareWith?: any) => {

                if (!shareWith) return;

                this.deviceProvider.share(this.device, shareWith.email, shareWith.firstName).then((shareWith: ISharedWith) => {
                    if (shareWith) this.device.sharedWith.push(shareWith);
                });
            }
        }).present();
    }

    public stopSharing(shareWith: ISharedWith, slidingItem: ItemSliding) {

        slidingItem.close();

        this.deviceProvider.stopSharing(this.device, shareWith.user.email).then(() => {
            this.device.sharedWith =
                this.device.sharedWith.filter((sw: ISharedWith) => sw.user.email !== shareWith.user.email);
        });
    }
}
