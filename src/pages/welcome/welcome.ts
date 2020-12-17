import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { SigninPage } from '../signin/signin';
import { SignUpPage } from '../signup/signup';

@Component({
    selector: 'page-welcome',
    templateUrl: 'welcome.html'
})
export class WelcomePage {

    constructor(public navCtrl: NavController) {

    }

    public pushSignInPage() {

        this.navCtrl.push(SigninPage);
    }

    public pushSignUpPage() {

        this.navCtrl.push(SignUpPage);
    }
}
