import { Component, OnInit } from '@angular/core';
import { AlertController, NavController } from 'ionic-angular';
import { ApiProvider, IAuthData } from '../../providers/api';
import { DevicesPage } from '../devices';
import { NgForm } from '@angular/forms';
import { Storage } from '@ionic/storage';
import { SignUpPage } from '../signup';
import { Logger } from '../../providers/logger';

const USERNAME_STORAGE_KEY      = 'username';
const USER_PASSWORD_STORAGE_KEY = 'user-password';

@Component({
    selector: 'page-signin',
    templateUrl: 'signin.html'
})
export class SigninPage implements OnInit {

    public authData: IAuthData = {
        username: '',
        password: ''
    };

    public submitted = false;

    public rememberPassword: boolean = true;

    public signInInProgress: boolean = false;

    constructor(private navCtrl: NavController,
                private apiProvider: ApiProvider,
                private logger: Logger,
                private alertCtrl: AlertController,
                private storage: Storage) {
        // -
    }

    public ngOnInit() {

        this.storage.get(USERNAME_STORAGE_KEY).then((data) => {
            this.authData.username = data;
        }).catch((err) => {
            this.logger.error(err);
        });

        this.storage.get(USER_PASSWORD_STORAGE_KEY).then((data) => {
            this.authData.password = data;
        }).catch((err) => {
            this.logger.error(err);
        });
    }

    public signIn(form: NgForm) {

        this.submitted = true;

        if (form.valid) {

            this.authData.username = this.authData.username.trim();
            this.authData.password = this.authData.password.trim();

            this.signInInProgress = true;

            this.apiProvider.createSession(this.authData)
                .then((user) => {

                    this.signInInProgress = false;

                    if (user) {
                        this.goDevicesPage();

                        this.storage.set(USERNAME_STORAGE_KEY, this.authData.username).catch((err) => {
                            this.logger.error(err);
                        });

                        if (this.rememberPassword) {

                            this.storage.set(USER_PASSWORD_STORAGE_KEY, this.authData.password).catch((err) => {
                                this.logger.error(err);
                            });

                        } else {

                            this.storage.remove(USER_PASSWORD_STORAGE_KEY).catch((err) => {
                                this.logger.error(err);
                            });
                        }
                    }
                })
                .catch((err) => {

                    this.signInInProgress = false;

                    if (err.status === 401) {

                        this.alertCtrl.create({
                            title: `Authentication error`,
                            message: err.error.error,
                            buttons: [{
                                text: 'OK',
                                role: 'cancel'
                            }]
                        }).present();
                    }
                });
        }
    }

    public pushSignUpPage() {

        this.navCtrl.push(SignUpPage);
    }

    public goDevicesPage() {

        this.navCtrl.setRoot(DevicesPage, {});
    }

    public recoverAccess() {

        this.alertCtrl.create({
            title: 'Recover password',
            inputs: [{
                type: 'text',
                name: 'email',
                label: 'E-mail',
                value: this.authData.username ? this.authData.username.trim() : ''
            }],
            buttons: [{
                text: 'Cancel',
                role: 'cancel'
            }, {
                text: 'Recover',
                handler: (data) => {
                    this.apiProvider.recoverAccess({email: data.email}).then(() => {

                        this.alertCtrl.create({
                            title: 'Success',
                            subTitle: `Please, check your E-mail for instructions`,
                            buttons: ['Ok']
                        }).present();
                    }).catch((err) => {
                        // -
                    });
                }
            }]
        }).present();
    }
}
