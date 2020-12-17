import { Component, OnInit } from '@angular/core';
import { Analytics } from '../../providers/analytics';
import { AppVersion } from '@ionic-native/app-version';
import { Platform, AlertController, LoadingController, ItemSliding } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { Logger } from '../../providers/logger';
import { Storage } from '@ionic/storage';
import { Device } from '@ionic-native/device';
import { API_INFO } from '../../providers/api';
// import { ImagePicker } from '@ionic-native/image-picker';
import { Base64 } from '@ionic-native/base64';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

interface ITicket {
    type: string;
    subject?: string;
    message: string;
    name?: string;
    email: string;

    appName: string;
    platform: string;
    versionCode: string;
    versionNumber: string;

    device?: any;

    screenshotBase64?: string;
}

@Component({
    templateUrl: 'support.html',
    selector: 'support-page'
})
export class SupportPage implements OnInit {

    public title: string = 'Support';

    public pageName: string = 'SupportPage';

    public ticket: ITicket = {
        type: 'question',

        message: '',
        email: '',

        appName: 'Trakkit',
        platform: 'unknown',
        versionCode: 'unknown',
        versionNumber: 'unknown'
    };

    public submitted: boolean;

    public imgBase64: SafeUrl;

    constructor(private platform: Platform,
                private appVersion: AppVersion,
                private device: Device,
                private alertCtrl: AlertController,
                private loadingCtrl: LoadingController,
                private http: HttpClient,
                // private imagePicker: ImagePicker,
                private base64: Base64,
                private storage: Storage,
                private domSanitizer: DomSanitizer,
                private logger: Logger) {

    }

    public ngOnInit() {

        if (this.platform.is('cordova')) {

            this.appVersion.getAppName().then((appName) => this.ticket.appName = appName);
            this.appVersion.getVersionCode().then((versionCode) => this.ticket.versionCode = versionCode);
            this.appVersion.getVersionNumber().then((versionNumber) => this.ticket.versionNumber = versionNumber);
        }

        this.ticket.platform = this.platform.is('ios') ? 'ios' : 'android';

        this.storage.get('support-email').then((email) => {
            if (email) {
                this.ticket.email = email;
            } else {
                // Use login E-mail
                this.storage.get('username').then((email) => {
                    if (email) this.ticket.email = email;
                }).catch((err) => {
                    this.logger.error(err);
                });
            }
        }).catch((err) => {
            this.logger.error(err);
        });

        this.storage.get('support-username').then((username) => {
            if (username) this.ticket.name = username;
        }).catch((err) => {
            this.logger.error(err);
        });

        this.ticket.device = {
            cordova: this.device.cordova,
            manufacturer: this.device.manufacturer,
            model: this.device.model,
            version: this.device.version,
            serial: this.device.serial,
            uuid: this.device.uuid
        };
    }

    public ionViewDidEnter() {

        this.submitted = false;
    }

    public submit() {

        if (!this.ticket.email || !this.validateEmail(this.ticket.email)) {

            this.alertCtrl.create({
                title: `Check your E-mail`,
                message: `Please, put your correct E-mail address`,
                buttons: [{
                    text: 'Ok'
                }]
            }).present();

            return;
        }

        if (!this.ticket.message) {

            this.alertCtrl.create({
                title: `Check your Text`,
                message: `Message is required`,
                buttons: [{
                    text: 'Ok'
                }]
            }).present();

            return;
        }

        const loader = this.loadingCtrl.create({content: 'Sending a request'});

        loader.present();

        let url = `${API_INFO.PROTOCOL}://${API_INFO.HOST}`;

        if (API_INFO.PORT) {

            url += `:${API_INFO.PORT}`;
        }

        this.http.put(`${url}/v1/tickets`, this.ticket).toPromise().then((data: any) => {

            loader.dismiss();

            if (data.result === true) {

                this.submitted = true;

                this.storage.set('support-email', this.ticket.email).catch((err) => {
                    this.logger.error(err);
                });

                this.storage.set('support-username', this.ticket.name).catch((err) => {
                    this.logger.error(err);
                });

            } else {

                this.logger.showErrorAlert({
                    message: `Unable to create new ticket`
                });
            }

        }).catch((err) => {
            loader.dismiss();

            this.logger.showErrorAlert({
                message: `Unable to create new ticket`
            });

            this.logger.error(err);
        });
    }

    // public attachScreenshot() {
    //
    //     this.imagePicker.getPictures({maximumImagesCount: 1}).then((results) => {
    //
    //         if (!results[0]) {
    //
    //             this.logger.notice(`No image selected`);
    //         }
    //
    //         const filePath: string = `file://${results[0]}`;
    //
    //         this.base64.encodeFile(filePath).then((base64File: string) => {
    //
    //             this.imgBase64               = this.domSanitizer.bypassSecurityTrustUrl(base64File);
    //             this.ticket.screenshotBase64 = base64File
    //                 .replace('unsafe:', '')
    //                 .replace(/\n/g, '')
    //                 .replace(/^data:image\/.*;base64,/, '');
    //
    //         }, (err) => {
    //             this.logger.error(err);
    //         });
    //
    //     }, (err) => {
    //         this.logger.error(err);
    //     });
    // }

    public removeScreenshot(slidingItem: ItemSliding) {

        slidingItem.close();

        delete this.imgBase64;
        delete this.ticket.screenshotBase64;
    }

    private validateEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }
}
