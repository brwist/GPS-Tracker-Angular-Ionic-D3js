import { Component, OnInit } from '@angular/core';
import { Analytics } from '../../providers/analytics';
import { AppVersion } from '@ionic-native/app-version';
import { Platform, NavParams, ViewController } from 'ionic-angular';

@Component({
    templateUrl: 'about.html',
    selector: 'about-app-page'
})
export class AboutPage implements OnInit {

    public title: string = 'About application';

    public appName: string;
    public versionCode: string;
    public versionNumber: string;

    constructor(public platform: Platform,
                public appVersion: AppVersion,
                public viewCtrl: ViewController) {

    }

    public ngOnInit() {

        if (this.platform.is('cordova')) {

            this.appVersion.getAppName().then((appName) => this.appName = appName);
            this.appVersion.getVersionCode().then((versionCode) => this.versionCode = versionCode);
            this.appVersion.getVersionNumber().then((versionNumber) => this.versionNumber = versionNumber);

        } else {

            this.appName       = 'Trakkit';
            this.versionCode   = 'unknown';
            this.versionNumber = 'unknown';
        }
    }

    public dismiss() {

        this.viewCtrl.dismiss();
    }
}
