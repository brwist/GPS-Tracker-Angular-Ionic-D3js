import { Component, OnInit } from '@angular/core';
import { NavController, AlertController, LoadingController, ItemSliding } from 'ionic-angular';
import { ApiProvider, IUserInfo, IExtraEmail, IAddExtraEmailData } from '../../../providers/api';
import { SignUpPage } from '../signup';
import { SigninPage } from '../signin';
import { AccountEditPage } from './edit/account-edit';
import { AccountEmailPage } from '../email/email';

@Component({
    selector: 'page-account-emails',
    templateUrl: 'emails.html'
})
export class AccountEmailsPage implements OnInit {

    public user: IUserInfo;

    constructor(private nav: NavController,
                private apiProvider: ApiProvider,
                private alertCtrl: AlertController,
                private loadingCtrl: LoadingController,
                private navCtrl: NavController) {

        // -
    }

    public ngOnInit() {

        this.apiProvider.user.subscribe((user: IUserInfo) => this.user = user);
    }

    public goChangeEmailPage() {

        this.navCtrl.push(AccountEmailPage);
    }

    public add() {

        this.alertCtrl.create({
            title: 'New E-mail',
            message: `Enter new E-mail address`,
            inputs: [{
                name: 'email',
                placeholder: 'E-mail'
            }],
            buttons: [{
                text: 'Cancel'
            }, {
                text: 'Save',
                handler: (data) => {

                    this.addExtraEmail({
                        email: data.email
                    });
                }
            }]
        }).present();
    }

    public remove(email: IExtraEmail, itemSliding: ItemSliding) {

        itemSliding.close();

        this.alertCtrl.create({
            title: `Remove E-mail`,
            message: `Do you agree to remove E-mail <strong>${email.value}</strong>?`,
            buttons: [{
                text: 'Cancel'
            }, {
                text: 'Remove',
                handler: () => {

                    this.removeExtraEmail(email);
                }
            }]
        }).present();
    }

    private addExtraEmail(addExtraEmailData: IAddExtraEmailData) {

        const loader = this.loadingCtrl.create({content: `Adding E-mail`});

        // noinspection JSIgnoredPromiseFromCall
        loader.present();

        this.apiProvider.addExtraEmail(addExtraEmailData).then(() => {

            this.apiProvider.fetchUserInfo().then(() => {

                loader.dismiss();
            });

        }).catch(() => {
            loader.dismiss();
        });
    }

    private removeExtraEmail(email: IExtraEmail) {

        const loader = this.loadingCtrl.create({content: `Removing E-mail`});

        // noinspection JSIgnoredPromiseFromCall
        loader.present();

        this.apiProvider.removeExtraEmail({
            email: email.value
        }).then(() => {

            this.apiProvider.fetchUserInfo().then(() => {

                loader.dismiss();
            });

        }).catch(() => {
            loader.dismiss();
        });
    }
}
