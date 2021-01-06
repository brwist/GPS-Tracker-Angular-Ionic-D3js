import { Component, NgZone } from '@angular/core';
import { CreateDevicePage } from '../device/create/create-device';
import { DevicePage } from '../device/device';
import {
    NavController, AlertController, ItemSliding, PopoverController, LoadingController,
    Platform
} from 'ionic-angular';
import { debounceTime, delay, filter } from 'rxjs/operators';
import { IPagination, ISorting } from '../../providers/base';
import { DeviceProvider, IDevice, IFirstAlert } from '../../providers/device';
import { DevicesPopoverPage } from './popover';
import { Storage } from '@ionic/storage';
import { Logger } from '../../providers/logger';
import { ApiProvider, IDeviceLocation } from '../../providers/api';
import { Keyboard } from '@ionic-native/keyboard';
import { FirstAlertProvider } from '../../providers/first-alert';

import * as moment from 'moment';
import * as async from 'async';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';
import { BaseComponent } from '../../app/base-component';

const SORTING_STORAGE_KEY = 'devices-sorting';

@Component({
    selector: 'page-devices',
    templateUrl: 'devices.html'
})
export class DevicesPage extends BaseComponent {
    /** list of first alerts */
    public firstAlerts: IFirstAlert[] = [];
    public devices: IDevice[] = [];

    public applyingSearch: boolean;
    public devicesLoading: boolean = true;

    public showButton = false;

    public highlightedDevicesRows: string[] = [];
    public highlightedDevicesWithAlert: string[] = [];

    private pagination: IPagination;
    private pageLimit = 15;

    private refresher: any;

    public get searchString(): string {
        return localStorage.getItem('device-search') || '';
    }
    public set searchString(value: string) {
        localStorage.setItem('device-search', value);
    }

    private sorting: ISorting;

    private deviceLocationSubscription: Subscription;
    private refreshSubscription: Subscription;
    private pushNotificationSubscription: Subscription;
    private firstAlertSubscription: Subscription;

    constructor(
        private navCtrl: NavController,
        private deviceProvider: DeviceProvider,
        private popoverCtrl: PopoverController,
        private loadingCtrl: LoadingController,
        private storage: Storage,
        private logger: Logger,
        private apiProvider: ApiProvider,
        private alertCtrl: AlertController,
        private ngZone: NgZone,
        private platform: Platform,
        private keyboard: Keyboard,
        private firstAlertProvider: FirstAlertProvider
    ) {

        super();

        this.sub = this.apiProvider.isOnline.subscribe({
            next: (isOnline) => {
                this.showButton = isOnline;
            }
        });
    }

    public ionViewDidEnter() {

        this.storage.get(SORTING_STORAGE_KEY).then((sorting) => {

            this.sorting = sorting || { sortingField: 'lastSeen', sortingOrder: 'desc' }; // default sorting
            this.loadDevices(true);

        }).catch((err) => {
            this.logger.error(err);
        });

        this.deviceLocationSubscription = this.apiProvider.deviceLocation.subscribe((deviceLocation: IDeviceLocation) => {

            // console.log('deviceLocation', deviceLocation);

            this.ngZone.run(() => {

                // If device is not in the list, unshift it, then remove the last one.

                let device;
                let unshifted = false;

                async.series([(callback) => {

                    device = _.find(this.devices, { id: deviceLocation.id });

                    // console.log('Device found in list', device);

                    if (!device) {

                        if (this.searchString) return callback();

                        this.deviceProvider.getItem(deviceLocation.id).then((d: IDevice) => {

                            device = d;

                            this.devices.unshift(device);
                            this.devices.pop();

                            unshifted = true;

                            // console.log('Device added to the list', device);

                            callback();

                        }).catch(callback);

                    } else {

                        callback();
                    }

                }, (callback) => {

                    setTimeout(callback, 100);

                }, (callback) => {

                    // console.log('device', device);

                    if (!device) return callback();

                    if (device.lastTrack.id === deviceLocation.lastTrack.id && !unshifted) {

                        // console.log(`Do not update list, unshifted: ${unshifted}`);

                        return callback();
                    }

                    const secondsFrom = moment().diff(moment(deviceLocation.lastTrack.createdAt), 'seconds');

                    if (secondsFrom <= 5) { // Highlight device for "fresh" updates only

                        this.highlightDeviceRow(device);
                    }

                    if (device.lastTrack) {

                        if (device.lastTrack.gy1 === 'H' && deviceLocation.lastTrack.gy1 === 'L') {

                            this.removeHighlightDeviceAlert(device.id);
                        }
                    }

                    device.battery = deviceLocation.lastTrack.battery;
                    device.lastTrack = deviceLocation.lastTrack;
                    device.lastSeen = deviceLocation.lastTrack.createdAt;

                    this.devices = this.devices.sort((a: IDevice, b: IDevice) => {

                        const order = this.sorting.sortingOrder === 'desc' ? -1 : 1;

                        if (this.sorting.sortingField === 'lastSeen') {
                            if (!a.lastSeen || !b.lastSeen) return 0;

                            if (moment(a.lastSeen).isAfter(moment(b.lastSeen))) return order;
                            return -order;
                        }

                        // TODO: Order by other "sortingField"
                        return 0;
                    });

                    // console.log(`Devices list updated`);

                    callback();

                }], (err) => {
                    if (err) alert(err.message);
                });
            });
        });

        this.refreshSubscription = this.platform.resume
            .pipe(
                delay(1000),
                // only when we on current page
                filter((x) => this.navCtrl.getActive().component === DevicesPage)
            ).subscribe(() => {
                this.loadDevices(true);
            });

        this.pushNotificationSubscription = this.apiProvider.pushNotification().subscribe((data) => {

            if (data.additionalData.notificationType === 'rule') {

                this.ngZone.run(() => {

                    this.highlightDeviceWithAlert(data.additionalData.deviceId);
                });
            }
        });

        this.firstAlertSubscription = this.apiProvider.firstAlert
            .pipe(debounceTime(1000))
            .subscribe(() => this._updateAlerts());
    }

    public ionViewWillLeave() {

        this.deviceLocationSubscription.unsubscribe();
        this.refreshSubscription.unsubscribe();
        this.pushNotificationSubscription.unsubscribe();
        this.firstAlertSubscription.unsubscribe();
    }

    /**
     * Dismiss alret
     * @param event - mouse click
     * @param id - device id
     */
    public dismissAlert(event: Event, id: string) {
        event.stopPropagation();
        this.deviceProvider.dismissFirstAlerts(id);
    }

    public searchItems(event) {

        const value = event.target.value;

        if (value && value.trim() !== '') {
            this.searchString = value.toLowerCase();
        } else {
            this.searchString = '';
        }

        this.applyingSearch = true;

        this.loadDevices();
    }

    public hideKeyboard() {

        // @ts-ignore
        document.activeElement.blur();

        this.keyboard.hide();
    }

    public sort(sortingField: string, sortingOrder: string) {

        this.sorting = { sortingField, sortingOrder };

        this.storage.set(SORTING_STORAGE_KEY, this.sorting).catch((err) => {
            this.logger.error(err);
        });

        this.loadDevices(true);
    }

    public presentPopover(ev) {

        this.popoverCtrl.create(DevicesPopoverPage, {
            sorting: this.sorting,
            newDeviceCallback: () => {
                this.goCreateDevicePage();
            },
            sortCallback: (sortingField: string, sortingOrder: string) => {
                this.sort(sortingField, sortingOrder);
            }
        }).present({ ev });
    }

    public doRefresh(refresher) {

        this.refresher = refresher;

        this.loadDevices();
    }

    public doInfinite(infiniteScroll) {

        if (this.pagination.nextPage) {

            const filter: any = {};

            if (this.searchString) {

                filter.search = this.searchString;
            }

            if (this.sorting) {

                filter.sortingField = this.sorting.sortingField;
                filter.sortingOrder = this.sorting.sortingOrder;
            }

            this.deviceProvider.getList({
                filter,
                pagination: {
                    page: this.pagination.nextPage,
                    limit: this.pageLimit
                }
            }).then((data: any) => {

                data.items.forEach((item) => {

                    let found = false;

                    this.devices.forEach((device) => {

                        if (device.id === item.id) {

                            found = true;
                        }
                    });

                    if (!found) {

                        this.devices.push(item);
                    }
                });

                this.pagination = data.pagination;

                infiniteScroll.complete();

            }).catch((err) => {
                console.log(err);
            });

        } else {

            infiniteScroll.complete();
        }
    }

    public removeDevice({ device, slidingItem }: { device: IDevice, slidingItem: ItemSliding }) {

        this.alertCtrl.create({
            title: 'Remove device?',
            message: `Do you really want to remove device "${device.name}" and all associated data?`,
            buttons: [{
                text: 'Cancel',
                role: 'cancel',
                handler: () => {
                    slidingItem.close();
                }
            }, {
                text: 'Yes, remove',
                handler: () => {
                    this.deviceProvider.removeItem(device.id).then(() => {

                        this.devices = this.devices.filter((dev) => dev.id !== device.id);

                    }).catch((err) => {
                        console.log(err);
                    });
                }
            }]
        }).present();
    }

    public goCreateDevicePage() {

        this.navCtrl.push(CreateDevicePage, {
            refreshCallback: () => {
                this.loadDevices(true);
            }
        });
    }

    public goDevicePage(id) {

        this.removeHighlightDeviceAlert(id);

        this.navCtrl.push(DevicePage, { id });
    }

    public isHighlighted(device: IDevice) {
        return this.highlightedDevicesRows.indexOf(device.id) > -1;
    }

    public isHighlightedWithAlert(device: IDevice) {

        return this.highlightedDevicesWithAlert.indexOf(device.id) > -1;
    }

    /**
    * Update first alerts
    */
    private _updateAlerts() {
        this.firstAlertProvider.getFirstAlerts()
            .then(({ items = [] }) => {
                this.firstAlerts = items;
            })
            .catch((e) => console.error(e));
    }

    private loadDevices(showLoader?: boolean) {

        let loader;

        const filter: any = {};

        if (this.searchString) {

            filter.search = this.searchString;
        }

        if (this.sorting) {

            filter.sortingField = this.sorting.sortingField;
            filter.sortingOrder = this.sorting.sortingOrder;
        }

        if (showLoader) {

            loader = this.loadingCtrl.create({ content: 'Loading devices' });

            loader.present();
        }

        this.devicesLoading = true;

        this.deviceProvider.getList({
            filter, pagination: { page: 1, limit: this.pageLimit }
        }).then((data: any) => {

            if (showLoader) loader.dismiss();
            this.applyingSearch = false;
            this.devicesLoading = false;

            this.devices = data.items;
            this.pagination = data.pagination;
            this._updateAlerts();

            if (this.refresher) {
                this.refresher.complete();
                this.refresher = null;
            }

        }).catch((err) => {
            if (showLoader) loader.dismiss();
            if (this.refresher) {
                this.refresher.complete();
                this.refresher = null;
            }
            this.applyingSearch = false;
            this.devicesLoading = false;
            console.log(err);
        });
    }

    private highlightDeviceRow(device: IDevice) {

        this.highlightedDevicesRows.push(device.id);

        setTimeout(() => {
            this.highlightedDevicesRows = this.highlightedDevicesRows.filter((id: string) => {
                return device.id !== id;
            });
        }, 2000);
    }

    private highlightDeviceWithAlert(deviceId: string) {

        this.highlightedDevicesWithAlert.push(deviceId);
    }

    private removeHighlightDeviceAlert(id: string) {

        setTimeout(() => {
            this.highlightedDevicesWithAlert = this.highlightedDevicesWithAlert.filter((deviceId: string) => {
                return deviceId !== id;
            });
        }, 100);
    }
}
