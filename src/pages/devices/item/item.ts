import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { IDevice, ITrack } from '../../../providers/device';
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

    constructor(
        public settingsProvider: Settings
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
}
