import { Component, OnDestroy, OnInit } from '@angular/core';
import { AlertController, ModalController } from 'ionic-angular';
import { IRington, ISettings, Settings } from '../../providers/settings';
import { Subscription } from 'rxjs/Subscription';
import { RingtonPickerPage } from './ringtone-picker';

declare const window: any;

@Component({
    selector: 'page-settings',
    templateUrl: 'settings.html'
})
export class SettingsPage implements OnInit, OnDestroy {

    public settings: ISettings;

    private settingsSubscription: Subscription;

    constructor(private alertCtrl: AlertController,
                private modalCtrl: ModalController,
                private settingsProvider: Settings) {

    }

    get nightModeEnabled() {

        return this.settings.nightMode.enabled;
    }

    set nightModeEnabled(value) {

        this.settings.nightMode.enabled = value;

        this.settingsProvider.saveSettings(this.settings);
    }

    get clusterizeDeviceMap() {

        return this.settings.clusterizeDeviceMap;
    }

    set clusterizeDeviceMap(value) {

        this.settings.clusterizeDeviceMap = value;

        this.settingsProvider.saveSettings(this.settings);
    }

    get bucketPointLoading() {

        return this.settings.bucketPointLoading;
    }

    set bucketPointLoading(value) {

        this.settings.bucketPointLoading = value;

        this.settingsProvider.saveSettings(this.settings);
    }

    get nightModeStart() {

        return this.settings.nightMode.start;
    }

    set nightModeStart(value) {

        console.log(`value: ${value}`);

        this.settings.nightMode.start = value;

        this.settingsProvider.saveSettings(this.settings);
    }

    get nightModeEnd() {

        return this.settings.nightMode.end;
    }

    set nightModeEnd(value) {

        this.settings.nightMode.end = value;

        this.settingsProvider.saveSettings(this.settings);
    }

    get showDeviceDebug() {

        return this.settings.showDeviceDebug;
    }

    set showDeviceDebug(value) {

        this.settings.showDeviceDebug = value;

        this.settingsProvider.saveSettings(this.settings);
    }

    get temperatureFormat() {
        return this.settings.temperatureFormat;
    }

    set temperatureFormat(value) {
        this.settings.temperatureFormat = value;
        this.settingsProvider.saveSettings(this.settings);
    }

    public ngOnInit() {

        this.settingsSubscription =
            this.settingsProvider.settings.subscribe((settings: ISettings) => this.settings = settings);
    }

    public ngOnDestroy() {

        this.settingsSubscription.unsubscribe();
    }

    public changeMapReloadInterval() {

        const inputs = [{
            label: `5 seconds`,
            value: `5000`
        }, {
            label: `10 seconds`,
            value: `10000`
        }, {
            label: `20 seconds`,
            value: `20000`
        }, {
            label: `30 seconds`,
            value: `30000`
        }, {
            label: `1 minute`,
            value: `60000`
        }, {
            label: `2 minute`,
            value: `120000`
        }, {
            label: `5 minute`,
            value: `300000`
        }, {
            label: `10 minute`,
            value: `600000`
        }].map((item) => {
            return {
                type: 'radio',
                label: item.label,
                value: item.value,
                checked: this.settings.mapReloadInterval === +item.value
            };
        });

        const alert = this.alertCtrl.create({
            title: `Refresh interval`,
            inputs,
            buttons: [{
                text: 'OK',
                handler: (data) => {

                    this.settings.mapReloadInterval = +data;
                    this.settingsProvider.saveSettings(this.settings);
                }
            }]
        });

        alert.addButton('Cancel');

        alert.present();
    }

    public changeNewTrackRingtone() {

        this.modalCtrl.create(RingtonPickerPage, {
            ringtone: this.settings.newTrackRingtone,
            callback: (ringtone?: IRington) => {

                this.settings.newTrackRingtone = ringtone;

                this.settingsProvider.saveSettings(this.settings);
            }
        }).present();
    }

    public openSystemNotificationsSettingsPage() {

        window.TrakkitCordovaPlugin.scan(`SHOW_NOTIFICATION_SETTINGS`, (result) => {
            console.log(`TrakkitCordovaPlugin.scan (SHOW_NOTIFICATION_SETTINGS): ${result}`);
        });
    }
}
