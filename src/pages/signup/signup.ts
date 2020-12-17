import { Component, OnInit } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';
import { ApiProvider, ISignUpData } from '../../providers/api';
import { DevicesPage } from '../devices/devices';

import * as worldCountries from 'world-countries';

@Component({
    selector: 'page-signin',
    templateUrl: 'signup.html'
})
export class SignUpPage implements OnInit {

    public signUpData: ISignUpData = {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        passwordConfirmation: ''
    };

    public countries: any = [{
        name: 'USA, Canada',
        callingCode: '1'
    }];

    public callingCode: string = '1';
    public phone: string;

    public error: string;

    public signUpInProgress: boolean = false;

    constructor(private navCtrl: NavController,
                private alertCtrl: AlertController,
                private apiProvider: ApiProvider) {

    }

    public ngOnInit() {

        worldCountries.forEach((country) => {

            if (country.callingCode[0]) {

                const name = country.name.common;

                if (name === 'United States' || name === 'Canada') {

                    return;
                }

                this.countries.push({
                    name,
                    callingCode: country.callingCode[0]
                });
            }
        });
    }

    public signUp() {

        this.signUpData.firstName            = this.signUpData.firstName.trim();
        this.signUpData.email                = this.signUpData.email.trim();
        this.signUpData.password             = this.signUpData.password.trim();
        this.signUpData.passwordConfirmation = this.signUpData.passwordConfirmation.trim();

        if (this.phone) {

            this.signUpData.phone = '+' + this.callingCode + this.phone.trim();
        }

        if (!this.signUpData.firstName) {

            this.alertCtrl.create({
                title: 'Error',
                subTitle: 'First name is required',
                buttons: ['Ok']
            }).present();

            return;
        }

        if (!this.signUpData.email) {

            this.alertCtrl.create({
                title: 'Error',
                subTitle: 'E-mail is required',
                buttons: ['Ok']
            }).present();

            return;
        }

        if (!this.signUpData.password) {

            this.alertCtrl.create({
                title: 'Error',
                subTitle: 'Password is required',
                buttons: ['Ok']
            }).present();

            return;
        }

        if (this.signUpData.password !== this.signUpData.passwordConfirmation) {

            this.alertCtrl.create({
                title: 'Error',
                subTitle: `Passwords don't match`,
                buttons: ['Ok']
            }).present();

            return;
        }

        if (this.signUpData.password.length < 6) {

            this.alertCtrl.create({
                title: 'Error',
                subTitle: 'Password length must be 6 charsets length at least',
                buttons: ['Ok']
            }).present();

            return;
        }

        this.signUpInProgress = true;

        this.apiProvider.signUp(this.signUpData)
            .then(() => {
                this.error            = null;
                this.signUpInProgress = false;
                this.goDevicesPage();
            })
            .catch((err) => {
                this.signUpInProgress = false;
                if (err._body) {
                    this.error = JSON.parse(err._body).error;
                } else {
                    this.error = 'Unknown error';
                }
            });
    }

    public goDevicesPage() {

        this.navCtrl.setRoot(DevicesPage, {});
    }
}
