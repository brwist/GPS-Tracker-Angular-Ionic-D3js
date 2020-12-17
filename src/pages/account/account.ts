import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Storage } from '@ionic/storage';

import { ApiProvider, IUserInfo } from '../../providers/api';
import { SignUpPage } from '../signup';
import { SigninPage } from '../signin';
import { AccountEditPage } from './personal-info/personal-info';
import { AccountEmailsPage } from './emails';
import { AccountPhonesPage } from './phones';
import { AccountPasswordPage } from './password';
import { Logger } from '../../providers/logger';

const USER_PASSWORD_STORAGE_KEY = 'user-password';

@Component({
    selector: 'page-account',
    templateUrl: 'account.html'
})
export class AccountPage {

    public user: IUserInfo;

    constructor(private nav: NavController,
                private apiProvider: ApiProvider,
                private navCtrl: NavController,
                private storage: Storage,
                private logger: Logger) {

        this.apiProvider.fetchUserInfo().catch((err) => {
            console.log(err);
        });

        apiProvider.user.subscribe((user) => this.user = user);
    }

    public signIn() {

        this.nav.setRoot(SigninPage);
    }

    public signUp() {

        this.nav.setRoot(SignUpPage);
    }

    public logOut() {

        this.storage.remove(USER_PASSWORD_STORAGE_KEY).catch((err) => {
            this.logger.error(err);
        });

        this.apiProvider.logOut();
    }

    public goEmailsPage() {

        this.navCtrl.push(AccountEmailsPage);
    }

    public goPhonesPage() {

        this.navCtrl.push(AccountPhonesPage);
    }

    public goChangePasswordPage() {

        this.navCtrl.push(AccountPasswordPage);
    }

    public goAccountEditPage() {

        this.navCtrl.push(AccountEditPage);
    }
}
