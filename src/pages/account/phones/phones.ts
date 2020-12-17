import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavController, AlertController, LoadingController, ItemSliding, ModalController } from 'ionic-angular';
import { ApiProvider, IUserInfo, IAddExtraPhoneData, IExtraPhone } from '../../../providers/api';
import { SignUpPage } from '../signup';
import { SigninPage } from '../signin';
import { AccountEditPage } from './edit/account-edit';
import { Subscription } from 'rxjs';
import { AccountPhonePage } from '../phone';
import { NewPhonePage } from './new-phone';

@Component({
    selector: 'page-account-phones',
    templateUrl: 'phones.html'
})
export class AccountPhonesPage implements OnInit, OnDestroy {

    public user: IUserInfo;

    private userSubscription: Subscription;

    constructor(private nav: NavController,
                private apiProvider: ApiProvider,
                private modalCtrl: ModalController,
                private alertCtrl: AlertController,
                private loadingCtrl: LoadingController,
                private navCtrl: NavController) {

        // -
    }

    public ngOnInit() {

        this.userSubscription = this.apiProvider.user.subscribe((user: IUserInfo) => this.user = user);
    }

    public ngOnDestroy() {

        this.userSubscription.unsubscribe();
    }

    public goChangePhonePage() {

        this.navCtrl.push(AccountPhonePage, {phone: this.user.phone});
    }

    public add() {

        this.modalCtrl.create(NewPhonePage, {
            callback: (phone: string) => {

                this.addExtraPhone({phone});
            }
        }).present();
    }

    public remove(phone: IExtraPhone, itemSliding: ItemSliding) {

        itemSliding.close();

        this.alertCtrl.create({
            title: `Remove Phone number`,
            message: `Do you agree to remove Phone <strong>${phone.value}</strong>?`,
            buttons: [{
                text: 'Cancel'
            }, {
                text: 'Remove',
                handler: () => {

                    this.removeExtraPhone(phone);
                }
            }]
        }).present();
    }

    private addExtraPhone(addExtraPhoneData: IAddExtraPhoneData) {

        const loader = this.loadingCtrl.create({content: `Adding new Phone number`});

        // noinspection JSIgnoredPromiseFromCall
        loader.present();

        this.apiProvider.addExtraPhone(addExtraPhoneData).then(() => {

            this.apiProvider.fetchUserInfo().then(() => {

                loader.dismiss();
            });

        }).catch(() => {
            loader.dismiss();
        });
    }

    private removeExtraPhone(phone: IExtraPhone) {

        const loader = this.loadingCtrl.create({content: `Removing Phone number`});

        // noinspection JSIgnoredPromiseFromCall
        loader.present();

        this.apiProvider.removeExtraPhone({
            phone: phone.value
        }).then(() => {

            this.apiProvider.fetchUserInfo().then(() => {

                loader.dismiss();
            });

        }).catch(() => {
            loader.dismiss();
        });
    }
}
