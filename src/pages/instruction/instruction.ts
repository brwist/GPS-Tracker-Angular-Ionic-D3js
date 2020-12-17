import {Component, OnInit} from '@angular/core';
import {AppVersion} from '@ionic-native/app-version';
import {Platform, ViewController} from 'ionic-angular';

@Component({
    templateUrl: 'instruction.html',
    selector: 'instruction-page'
})
export class InstructionPage implements OnInit {

    public title: string = 'Help';

    constructor(public platform: Platform,
                public appVersion: AppVersion,
                public viewCtrl: ViewController) {

    }

    public ngOnInit() {
        //
    }

    public dismiss() {

        this.viewCtrl.dismiss();
    }

    public openSettings() {
        // this.openNativeSettings.open('tethering');

        // @ts-ignore
        window.cordova.plugins.settings.open('wifi', () => {
            console.log('opened settings');
        }, () => {
            console.log('failed to open settings');
        });
    }
}
