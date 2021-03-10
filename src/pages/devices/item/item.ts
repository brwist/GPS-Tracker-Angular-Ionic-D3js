import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AlertController, ItemSliding } from 'ionic-angular';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { DeviceProvider, IDevice, ITrack } from '../../../providers/device';
import { ISettings, Settings } from '../../../providers/settings';
import { TrackProvider } from '../../../providers/track';

@Component({
    selector: 'device-list-item',
    templateUrl: 'item.html'
})
export class DevicesListItemComponent {

    public settings: ISettings;

    public _device: IDevice;
    @Input()
    set device(device: IDevice) {
        this._device = device;
    }

    get device() {
        return this._device;
    }

    @Input()
    public goDevicePage: (id: string) => void;

    @Input()
    public isHighlighted: (device: IDevice) => boolean;

    @Input()
    public isHighlightedWithAlert: (device: IDevice) => boolean;

    @Output()
    public onRemove = new EventEmitter();

    public settingsSubscription: Subscription;

    get snoozed() {
        if (!this.device || !this.device.snoozeTo) return false;

        return moment(this.device.snoozeTo).isSameOrAfter(moment());
    }

    public isTHS = DeviceProvider.isTHS;
    public isGPS = DeviceProvider.isGPS;

    constructor(
        public settingsProvider: Settings,
        public deviceProvider: DeviceProvider,
        public alertCtrl: AlertController,
    ) {
        this.settingsSubscription = this.settingsProvider.settings.subscribe((settings: ISettings) => {
            this.settings = settings;
        });
    }

    public getTrackMapUrl(track: ITrack) {
        if (!track) {
            return 'assets/img/no-location.png';
        }

        return TrackProvider.getTrackMapUrl(track, {
            resolution: '160x160',
            zoom: 17
        });
    }

    public removeDevice(device, slidingItem) {
        this.onRemove.next({ device, slidingItem });
    }

    public onSwipe() {
        return false;
    }

    public ngOnDestroy() {
        this.settingsSubscription.unsubscribe();
    }

    public snoozeItem(device: IDevice, itemSliding: ItemSliding) {
        this.alertCtrl.create({
            title: 'Snooze For N hours',
            message: 'Enter value in hours',
            inputs: [{
                name: 'hours',
                placeholder: 'Hours',
                value: '3'
            }],
            buttons: [{
                text: 'Cancel'
            }, {
                text: 'Save',
                handler: ({ hours }) => {
                    hours = Number(hours);

                    if (hours < 1) return;

                    this.deviceProvider.snoozeAlerts(device.id, hours)
                        .then(() => {
                            console.log('OK');
                            itemSliding.close();
                        }).catch((error) => {
                            console.log(error);
                        })
                }
            }]
        }).present();
    }
}
