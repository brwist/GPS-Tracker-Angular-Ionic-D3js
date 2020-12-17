import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavController, AlertController, LoadingController } from 'ionic-angular';
import { ApiProvider, IUserInfo, IChangePasswordData } from '../../../providers/api';
import { Subscription } from 'rxjs';

@Component({
    selector: 'page-account-password',
    templateUrl: 'password.html'
})
export class AccountPasswordPage implements OnInit, OnDestroy {

    public user: IUserInfo;

    public changePasswordData: IChangePasswordData = {
        currentPassword: '',
        password: '',
        passwordConfirmation: ''
    };

    private userSubscription: Subscription;

    constructor(private apiProvider: ApiProvider,
                private alertCtrl: AlertController,
                private navCtrl: NavController,
                private loadingCtrl: LoadingController) {

        // -
    }

    public ngOnInit() {

        this.userSubscription = this.apiProvider.user.subscribe((user: IUserInfo) => this.user = user);
    }

    public ngOnDestroy() {

        this.userSubscription.unsubscribe();
    }

    public changePassword() {

        if (!this.changePasswordData.currentPassword) {

            this.alertCtrl.create({
                title: `Error`,
                message: `Current password is required`,
                buttons: [{
                    text: 'Ok'
                }]
            }).present();

            return;
        }

        if (!this.changePasswordData.password) {

            this.alertCtrl.create({
                title: `Error`,
                message: `New password is required`,
                buttons: [{
                    text: 'Ok'
                }]
            }).present();

            return;
        }

        if (this.changePasswordData.password !== this.changePasswordData.passwordConfirmation) {

            this.alertCtrl.create({
                title: `Error`,
                message: `Password confirmation doesn't match Password`,
                buttons: [{
                    text: 'Ok'
                }]
            }).present();

            return;
        }

        const loader = this.loadingCtrl.create({content: `Changing E-mail address`});

        // noinspection JSIgnoredPromiseFromCall
        loader.present();

        this.apiProvider.changePassword(this.changePasswordData).then(() => {

            loader.dismiss();

            this.alertCtrl.create({
                title: `Success`,
                message: `Password changed succesfully`,
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
