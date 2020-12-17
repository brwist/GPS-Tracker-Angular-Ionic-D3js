import { Component } from '@angular/core';
import { NotificationPage } from '../notification/notification';
import { AlertController, NavParams, ViewController } from 'ionic-angular';

import * as worldCountries from 'world-countries';

@Component({
    selector: 'page-new-phone',
    templateUrl: 'new-phone.html'
})
export class NewPhonePage {

    public callingCode: string = '1';

    public phone: string;

    public countries: any = [];

    private callback: (phone: string) => void;

    constructor(private params: NavParams,
                private alertCtrl: AlertController,
                private viewCtrl: ViewController) {

    }

    public ngOnInit() {

        this.callback = this.params.get('callback');

        worldCountries.forEach((country) => {

            if (country.callingCode[0]) {

                this.countries.push({
                    name: country.name.official,
                    callingCode: country.callingCode[0]
                });
            }
        });
    }

    public save() {

        if (!/^\d+$/.test(this.phone)) {

            this.alertCtrl.create({
                title: 'Error',
                subTitle: 'Phone number can contains digits only',
                buttons: ['Ok']
            }).present();

            return;
        }

        const phone = '+' + this.callingCode + this.phone;

        this.callback(phone);

        this.viewCtrl.dismiss();
    }

    public dismiss() {

        this.viewCtrl.dismiss();
    }
}
