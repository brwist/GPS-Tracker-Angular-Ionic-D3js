import { Component } from '@angular/core';
import { AppVersion } from '@ionic-native/app-version';
import { Platform, ViewController } from 'ionic-angular';
import { Logger } from '../../providers/logger';
import { TrakkitProvider, TRAKKIT_URL } from '../../providers/trakkit';

declare const XDomainRequest;
declare const cordova;

@Component({
    templateUrl: 'trakkit-config.html',
    selector: 'trakkit-config-page'
})
export class TrakkitConfigPage {

    public title: string = 'Trakkit Configuration';

    public error: boolean;

    public isConnecting: boolean = true;

    constructor(
        public platform: Platform,
        public appVersion: AppVersion,
        public viewCtrl: ViewController,
        public trakkitProvider: TrakkitProvider,
        public logger: Logger
    ) {

    }

    public async ionViewDidEnter() {
        await this.tryOpenConfigPage();
    }

    public async tryOpenConfigPage() {

        this.error = false;
        this.isConnecting = true;

        try {

            await testTrakkitAvailability();

            try {
                await this.trakkitProvider.storeMAC();
            } catch (error) {
                // mymac.txt unavailable
            }

            this.error = false;
            this.isConnecting = false;

            this.openAppBrowser(TRAKKIT_URL);

        } catch (err) {

            this.error = true;
            this.isConnecting = false;
        }
    }

    public openHelpVideoPage() {
        this.openAppBrowser('https://www.youtube.com/embed/PBoMm72ExJ8');
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

    private openAppBrowser(url) {
        // Open in browser + attach footer with Done button
        return cordova.InAppBrowser.open(url, '_blank', 'location=no,footer=yes,footercolor=#CC000000,closebuttoncaption=Done,closebuttoncolor=#00FFFF');
    }

}

function createCORSRequest(method, url) {

    let xhr = new XMLHttpRequest();

    if ('withCredentials' in xhr) {

        // XHR for Chrome/Firefox/Opera/Safari.
        xhr.open(method, url, true);

    } else if (typeof XDomainRequest !== 'undefined') {

        // XDomainRequest for IE.
        xhr = new XDomainRequest();
        xhr.open(method, url);

    } else {

        // CORS not supported.
        xhr = null;
    }

    if (xhr) {
        xhr.timeout = 2000;
    }

    return xhr;
}

function testTrakkitAvailability() {

    return new Promise((resolve, reject) => {

        const xhr = createCORSRequest('GET', TRAKKIT_URL);

        if (!xhr) {
            alert('CORS not supported');
            reject();
        }

        // Response handlers.
        xhr.onload = () => {

            console.log('Ok');
            resolve();
        };

        xhr.ontimeout = () => {

            console.log('Timeout error');
            reject();
        };

        xhr.onerror = (err) => {

            console.log(err);
            resolve();
        };

        xhr.send();
    });
}
