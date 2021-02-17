import { Component } from '@angular/core';
import { AlertPage } from './alert/alert';
import { NotificationPage } from './notification';
import {
    NavController, PopoverController, Refresher, ToastController, LoadingController,
    ItemSliding,
    AlertController
} from 'ionic-angular';
import { IPagination } from '../../providers/base';
import { AlertProvider, IAlert } from '../../providers/alert';
import { AlertOrNotificationPopoverPage } from './popover';
import { Logger } from '../../providers/logger';
import { INotification, NotificationProvider } from '../../providers/notification';

import * as moment from 'moment';
import { DeviceProvider } from '../../providers/device';

@Component({
    selector: 'page-alerts-and-notifications',
    templateUrl: 'alerts-and-notifications.html'
})
export class AlertsAndNotificationsPage {

    public alerts: IAlert[] = [];
    public notifications: INotification[] = [];

    public alertsAndNotifications: Array<IAlert | INotification> = [];

    private alertsPagination: IPagination;
    private notificationsPagination: IPagination;
    private pageLimit = 30;

    public isTHS = DeviceProvider.isTHS;

    constructor(private navCtrl: NavController,
        private popoverCtrl: PopoverController,
        private toastCtrl: ToastController,
        private logger: Logger,
        private loadingCtrl: LoadingController,
        private alertProvider: AlertProvider,
        private notificationProvider: NotificationProvider,
        private deviceProvider: DeviceProvider,
        private alertCtrl: AlertController,) {

    }

    public async doRefresh(refresher: Refresher) {

        try {

            await Promise.all([
                this.loadAlerts({ pagination: { page: 1, limit: this.pageLimit } }),
                this.loadNotifications({ pagination: { page: 1, limit: this.pageLimit } })
            ]);

            this.alertsAndNotifications = [
                ...this.alerts,
                ...this.notifications
            ];

            this.sortData();

            refresher.complete();

        } catch (err) {

            // Ignore
        }
    }

    public async doInfinite(infiniteScroll) {

        if (this.alertsPagination.nextPage) {

            const data = await this.alertProvider.getList({
                pagination: {
                    page: this.alertsPagination.nextPage,
                    limit: this.pageLimit
                }
            });

            data.items.forEach((item) => {

                let found = false;

                this.alertsAndNotifications.forEach((it) => {

                    if (it.id === item.id) {

                        found = true;
                    }
                });

                if (!found) {

                    this.alertsAndNotifications.push(item);
                }
            });

            this.alertsPagination = data.pagination;
        }

        if (this.notificationsPagination.nextPage) {

            const data = await this.notificationProvider.getList({
                pagination: {
                    page: this.notificationsPagination.nextPage,
                    limit: this.pageLimit
                }
            });

            data.items.forEach((item) => {

                let found = false;

                this.alertsAndNotifications.forEach((it) => {

                    if (it.id === item.id) {

                        found = true;
                    }
                });

                if (!found) {

                    this.alertsAndNotifications.push(item);
                }
            });

            this.notificationsPagination = data.pagination;
        }

        this.sortData();

        infiniteScroll.complete();
    }

    snoozeItem(item: IAlert, itemSliding: ItemSliding) {
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
                    this.deviceProvider.snoozeAlerts(item.device.id, Number(hours))
                        .then(() => {
                            console.log('OK');
                            itemSliding.close();
                        }).catch((err) => {
                            this.logger.error(err);
                        })
                }
            }]
        }).present();
    }

    public removeItem(item) {

        if (this.isAlert(item)) {

            this.alertProvider.removeItem(item.id).then(() => {

                this.alertsAndNotifications = this.alertsAndNotifications.filter((it) => it.id !== item.id);

            }).catch((err) => {
                this.logger.error(err);
            });

        } else {

            this.notificationProvider.removeItem(item.id).then(() => {

                this.alertsAndNotifications = this.alertsAndNotifications.filter((it) => it.id !== item.id);

            }).catch((err) => {
                this.logger.error(err);
            });
        }
    }

    public markAsSeen(item: IAlert | INotification, itemSliding: ItemSliding) {

        itemSliding.close();

        if (item.seen) {

            return;
        }

        if (this.isAlert(item)) {

            this.alertProvider.markAsSeen(item.id).then(() => {

                item.seen = true;

            }).catch((err) => {
                this.logger.error(err);
            });

        } else {

            this.notificationProvider.markAsSeen(item.id).then(() => {

                item.seen = true;

            }).catch((err) => {
                this.logger.error(err);
            });
        }
    }

    public goAlertPage(id) {

        this.navCtrl.push(AlertPage, { id });
    }

    public goNotificationPage(id) {

        this.navCtrl.push(NotificationPage, { id });
    }

    public async ionViewDidEnter() {

        try {

            await Promise.all([
                this.loadAlerts({ pagination: { page: 1, limit: this.pageLimit } }),
                this.loadNotifications({ pagination: { page: 1, limit: this.pageLimit } })
            ]);

            this.alertsAndNotifications = [
                ...this.alerts,
                ...this.notifications
            ];

            this.sortData();

        } catch (err) {

            // Ignore
        }
    }

    public presentPopover(ev) {

        this.popoverCtrl.create(AlertOrNotificationPopoverPage, {
            markAllAsSeenCallback: () => {
                this.markAllAsSeen();
            },
            clearAllCallback: () => {
                this.clearAll();
            }
        }).present({ ev });
    }

    public isAlert(item: IAlert | INotification) {

        return !((item as INotification).data);
    }

    private loadAlerts(options) {

        return new Promise((resolve, reject) => {

            const loader = this.loadingCtrl.create({ content: `Loading alerts` });

            // noinspection JSIgnoredPromiseFromCall
            loader.present();

            this.alertProvider.getList(options).then((data: any) => {

                // noinspection JSIgnoredPromiseFromCall
                loader.dismiss();

                this.alerts = data.items;
                this.alertsPagination = data.pagination;

                resolve(true);

            }).catch((err) => {
                // noinspection JSIgnoredPromiseFromCall
                loader.dismiss();
                this.logger.error(err);
                reject(err);
            });
        });
    }

    private loadNotifications(options) {

        return new Promise((resolve, reject) => {

            this.notificationProvider.getList(options).then((data: any) => {

                this.notifications = data.items;
                this.notificationsPagination = data.pagination;

                resolve(true);

            }).catch((err) => {
                console.log(err);
                reject(err);
            });
        });
    }

    private markAllAsSeen() {

        const toast = this.toastCtrl.create({
            message: `Operation can take some time`,
            position: 'bottom'
        });

        toast.present();

        this.alertProvider.markAsSeenAll().then(() => {

            this.notificationProvider.markAsSeenAll().then(() => {

                toast.dismiss();

                this.alertsAndNotifications = this.alertsAndNotifications.map((item) => {
                    item.seen = true;
                    return item;
                });

            }).catch((err) => {
                toast.dismiss();
                this.logger.error(err);
            });

        }).catch((err) => {
            toast.dismiss();
            this.logger.error(err);
        });
    }

    private clearAll() {

        const toast = this.toastCtrl.create({
            message: `Operation can take some time`,
            position: 'bottom'
        });

        toast.present();

        this.alertProvider.clearAll().then(() => {

            this.notificationProvider.clearAll().then(() => {

                toast.dismiss();

                this.alertsAndNotifications = [];

            }).catch((err) => {
                toast.dismiss();
                this.logger.error(err);
            });

        }).catch((err) => {
            toast.dismiss();
            this.logger.error(err);
        });
    }

    private sortData() {

        this.alertsAndNotifications = this.alertsAndNotifications.sort((a: any, b: any) => {

            return moment(a.createdAt).isAfter(moment(b.createdAt)) ? -1 : 1;
        });
    }
}
