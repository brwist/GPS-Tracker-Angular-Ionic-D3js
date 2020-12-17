import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavController, AlertController, LoadingController, NavParams } from 'ionic-angular';
import { ApiProvider, IUserInfo, IChangePhoneData } from '../../../providers/api';
import { SignUpPage } from '../signup';
import { SigninPage } from '../signin';
import { AccountEditPage } from './edit/account-edit';
import { Subscription } from 'rxjs';

import * as worldCountries from 'world-countries';

@Component({
    selector: 'page-account-phone',
    templateUrl: 'phone.html'
})
export class AccountPhonePage implements OnInit, OnDestroy {

    public callingCode: string = '1';

    public user: IUserInfo;

    public countries: any = [];

    public phone: string;
    public newPhone: string;

    private userSubscription: Subscription;

    constructor(private apiProvider: ApiProvider,
                private alertCtrl: AlertController,
                private navCtrl: NavController,
                private params: NavParams,
                private loadingCtrl: LoadingController) {

        // -
    }

    public ngOnInit() {

        this.phone = this.params.get('phone');

        this.userSubscription = this.apiProvider.user.subscribe((user: IUserInfo) => this.user = user);

        worldCountries.forEach((country) => {

            if (country.callingCode[0]) {

                this.countries.push({
                    name: country.name.official,
                    callingCode: country.callingCode[0]
                });
            }
        });
    }

    public ngOnDestroy() {

        this.userSubscription.unsubscribe();
    }

    public changePhone() {

        if (!/^\d+$/.test(this.newPhone)) {

            this.alertCtrl.create({
                title: 'Error',
                subTitle: 'Phone number can contains digits only',
                buttons: ['Ok']
            }).present();

            return;
        }

        const newPhone = '+' + this.callingCode + this.newPhone;

        const loader = this.loadingCtrl.create({content: `Updating phone number`});

        // noinspection JSIgnoredPromiseFromCall
        loader.present();

        this.apiProvider.changePhone({newPhone}).then(() => {

            this.apiProvider.fetchUserInfo().then(() => {

                loader.dismiss();
            });

            this.alertCtrl.create({
                title: `Success`,
                message: `Please follow the instructions in the Text Message just sent to your Phone Number`,
                buttons: [{
                    text: 'Ok'
                }]
            }).present();

            this.navCtrl.pop();

        }).catch(() => {

            loader.dismiss();
        });
    }
}
