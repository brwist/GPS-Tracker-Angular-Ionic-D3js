import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavController, LoadingController, ModalController } from 'ionic-angular';
import { ApiProvider, IUserInfo } from '../../../providers/api';
import { Subscription } from 'rxjs';
import { TimeZonePickerPage } from './timezone-picker';

@Component({
    selector: 'page-account-edit',
    templateUrl: 'personal-info.html'
})
export class AccountEditPage implements OnInit, OnDestroy {

    public user: IUserInfo;

    private userInfoSubscription: Subscription;

    constructor(private navCtrl: NavController,
                private loadingCtrl: LoadingController,
                private modalCtrl: ModalController,
                private apiProvider: ApiProvider) {

    }

    public ngOnInit() {

        this.userInfoSubscription = this.apiProvider.user.subscribe((user: IUserInfo) => this.user = user);
    }

    public ngOnDestroy() {

        this.userInfoSubscription.unsubscribe();
    }

    public openTimeZonePicker() {

        this.modalCtrl.create(TimeZonePickerPage, {
            timeZone: this.user.timeZone,
            callback: (timeZone: string) => {

                this.user.timeZone = timeZone;

                // noinspection JSIgnoredPromiseFromCall
                this.doSave();
            }
        }).present();
    }

    public save() {

        this.doSave().then(() => {
            this.navCtrl.pop();
        });
    }

    private doSave() {

        return new Promise((resolve, reject) => {

            const loader = this.loadingCtrl.create({content: `Changing E-mail address`});

            // noinspection JSIgnoredPromiseFromCall
            loader.present();

            this.apiProvider.updateUserInfo(this.user).then(() => {

                loader.dismiss();

                resolve();

            }).catch((err) => {
                loader.dismiss();
                reject(err);
            });
        });
    }
}
