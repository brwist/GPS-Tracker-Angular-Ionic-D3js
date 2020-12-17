import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavController, AlertController, LoadingController } from 'ionic-angular';
import { ApiProvider, IUserInfo, IChangeEmailData } from '../../../providers/api';
import { SignUpPage } from '../signup';
import { SigninPage } from '../signin';
import { AccountEditPage } from './edit/account-edit';
import { Subscription } from 'rxjs';

@Component({
    selector: 'page-account-email',
    templateUrl: 'email.html'
})
export class AccountEmailPage implements OnInit, OnDestroy {

    public user: IUserInfo;

    public changeEmailData: IChangeEmailData = {
        newEmail: ''
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

    public changeEmail() {

        const loader = this.loadingCtrl.create({content: `Changing E-mail address`});

        // noinspection JSIgnoredPromiseFromCall
        loader.present();

        this.apiProvider.changeEmail(this.changeEmailData).then(() => {

            this.apiProvider.fetchUserInfo().then(() => {

                loader.dismiss();
            });

            this.alertCtrl.create({
                title: `Success`,
                message: `Please follow the instructions in the Messages just sent to your E-mail addresses`,
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
