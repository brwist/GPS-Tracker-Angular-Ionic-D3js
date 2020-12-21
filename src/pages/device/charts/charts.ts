import { Component, OnInit } from '@angular/core';
import { AlertPage } from '../alert/alert';
import { LoadingController, NavParams, NavController, ModalController } from 'ionic-angular';
import { AlertsPopoverPage } from './popover';
import { Logger } from '../../../providers/logger';
import { IDevice, ITrack } from '../../../providers/device';
import { TrackProvider } from '../../../providers/track';
import { TrackPage } from './track';
import { DateSettingsPage } from '../date-settings';
import { IDateSettings } from '../device';
import { Storage } from '@ionic/storage';
import { ApiProvider, IUserInfo } from '../../../providers/api';
import { Subscription } from 'rxjs/Rx';

import * as moment from 'moment';
import * as momentTimezone from 'moment-timezone';
import * as async from 'async';
import * as d3 from "d3";

declare var window: any;
const DATE_SETTINGS_STORAGE_KEY     = 'device-date-settings-for-charts';
const MAX_ITEMS_PER_DAY_STORAGE_KEY = 'max-items-per-day';

@Component({
    selector: 'page-charts',
    templateUrl: 'charts.html'
})
export class DeviceChartsPage implements OnInit {
    public chartData: any = {};
    public groupedBy: string;
    public pointsTotal: number;

    public device: IDevice;

    public chartDataColors = [[{
        backgroundColor: 'rgba(148, 159, 177, 0.2)',
        borderColor: 'rgba(148, 159, 177,1)',
        pointBackgroundColor: 'rgba(148, 159, 177, 1)',
        pointBorderColor: 'rgba(148, 159, 177, 1)',
        pointHoverBackgroundColor: 'rgba(148, 159, 177, 0.5)',
        pointHoverBorderColor: 'rgba(148, 159, 177, 0.8)'
    }], [{
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        pointBackgroundColor: 'rgba(54, 162, 235, 1)',
        pointBorderColor: 'rgba(54, 162, 235, 1)',
        pointHoverBackgroundColor: 'rgba(54, 162, 235, 0.5)',
        pointHoverBorderColor: 'rgba(54, 162, 235, 1)'
    }]];

    public maxNumberOfPointsModel: number | string;

    private data: any;

    private chartTypeModel: string = 'batteryOrVolts';

    private userSubscription: Subscription;

    private timeZone: string = momentTimezone.tz.guess();

    private dateSettings: IDateSettings = {
        type: 'day',
        value: 'today',
        startDate: moment(),
        endDate: moment()
    };

    private startDate: any;
    private endDate: any;

    constructor(private logger: Logger,
                private params: NavParams,
                private loadingCtrl: LoadingController,
                private navCtrl: NavController,
                private storage: Storage,
                private modalCtrl: ModalController,
                private trackProvider: TrackProvider,
                private apiProvider: ApiProvider) {

        this.device = this.params.get('device');
    }

    public ngOnInit() {
        async.series([(callback) => {

            this.storage.get(DATE_SETTINGS_STORAGE_KEY).then((dateSettings?: IDateSettings) => {

                if (dateSettings) {

                    this.dateSettings = dateSettings;

                    if (this.dateSettings.type !== 'custom') {

                        const updatedDateRange = DateSettingsPage.getDateRange(this.dateSettings.value);

                        if (updatedDateRange) {
                            this.dateSettings.startDate = updatedDateRange.startDate;
                            this.dateSettings.endDate   = updatedDateRange.endDate;
                        }
                    }
                }

                callback();

            }).catch((err) => {
                callback(err);
            });

        }, (callback) => {

            this.storage.get(MAX_ITEMS_PER_DAY_STORAGE_KEY).then((maxNumberOfPoints?: number) => {

                if (maxNumberOfPoints) {

                    this.maxNumberOfPointsModel = maxNumberOfPoints;

                } else {

                    this.maxNumberOfPointsModel = 50;
                }

                callback();

            }).catch((err) => {
                callback(err);
            });

        }], (err) => {
            if (err) this.logger.error(err);

            this.loadChartData();
        });

        this.userSubscription = this.apiProvider.user.subscribe((user: IUserInfo) => {

            if (user && user.timeZone) {

                this.timeZone = user.timeZone;
            }
        });
    }

    public ngOnDestroy() {

        this.userSubscription.unsubscribe();
    }

    set chartType(value) {

        this.chartTypeModel = value;

        switch (value) {
            case 'batteryOrVolts':
                break;
            case 'temperature':
                break;
            default:
                console.error(`Unexpected chartType: "${value}"`);
        }
    }

    get chartType() {

        return this.chartTypeModel;
    }

    get dateRangeString() {

        if (!this.dateSettings || !this.dateSettings.startDate || !this.dateSettings.endDate) return 'Date range unknown';

        if (!moment(this.dateSettings.startDate).isValid() || !moment(this.dateSettings.endDate).isValid()) {

            this.logger
                .warning(`GET:dateRangeString: one of date is invalid. "${this.dateSettings.startDate}" - "${this.dateSettings.endDate}"`);

            return 'Date range unknown';
        }

        return moment(this.dateSettings.startDate).format('MMM D') + ' - ' + moment(this.dateSettings.endDate).format('MMM D');
    }

    set maxNumberOfPoints(value) {

        this.storage.set(MAX_ITEMS_PER_DAY_STORAGE_KEY, value).then(() => {

            this.maxNumberOfPointsModel = value;

            this.renderCharts();

        }).catch((err) => {
            this.logger.error(err);
        });
    }

    get maxNumberOfPointsValue() {

        return this.maxNumberOfPointsModel;
    }

    set maxNumberOfPointsValue(value) {

        this.storage.set(MAX_ITEMS_PER_DAY_STORAGE_KEY, value).then(() => {

            this.maxNumberOfPointsModel = value;

            this.renderCharts();

        }).catch((err) => {
            this.logger.error(err);
        });
    }

    get maxNumberOfPointsNumber() {

        return this.maxNumberOfPointsModel === 'All' ? Number.MAX_SAFE_INTEGER : this.maxNumberOfPointsModel;
    }

    get isCableKitConnected() {

        return this.device.lastTrack && this.device.lastTrack.battery === 'K';
    }

    /**
     * Trigger on date change
     */
    public presentDateSettings() {

        this.modalCtrl.create(DateSettingsPage, {
            dateSettings: Object.assign({}, this.dateSettings),
            callback: (dateSettings: IDateSettings) => {

                this.dateSettings = dateSettings;

                this.storage.set(DATE_SETTINGS_STORAGE_KEY, dateSettings).catch((err) => {
                    this.logger.error(err);
                });

                this.loadChartData();
            }
        }).present();
    }

    private loadChartData() {

        if (this.dateSettings.startDate && moment(this.dateSettings.startDate).isValid()) {

            this.startDate = this.dateSettings.startDate;

        } else {

            this.startDate = moment().subtract(1, 'day');
        }

        if (this.dateSettings.endDate && moment(this.dateSettings.endDate).isValid()) {

            this.endDate = this.dateSettings.endDate;

        } else {

            this.endDate = moment();
        }

        const select = ['timestamp', 'temperature', 'ntc1'];

        if (this.isCableKitConnected) {

            select.push('volts');

        } else {

            select.push('battery');
        }

        this.trackProvider.getListForChart(this.device.id, {
            filter: {
                startDate:
                    encodeURIComponent(momentTimezone(this.startDate).tz(this.timeZone).startOf('day').format()),
                endDate:
                    encodeURIComponent(momentTimezone(this.endDate).tz(this.timeZone).endOf('day').format())
            },
            select,
            lean: true
        }).then((data: any) => {

            this.data = data;

            if (this.isCableKitConnected) {

                let ntcIsValid = false;

                for (const item of this.data.items) {

                    if (/\d+\.?\d?/.test(item.ntc1)) {

                        ntcIsValid = true;

                        break;
                    }
                }

                if (ntcIsValid) {

                    this.data.items = this.data.items.map((item) => {

                        item.temperature = item.ntc1;

                        return item;
                    });
                }
            }

            this.renderCharts();

        }).catch((err) => {
            this.logger.error(err);
        });
    }

    private renderCharts() {

        let points;

        this.groupedBy = null;

        if (this.data.items.length > this.maxNumberOfPointsNumber) {

            if (moment(this.endDate).diff(this.startDate, 'days') === 0) {

                points = this.groupBy('hour');

            } else {

                points = this.groupBy('day');
            }

        } else {

            points = this.data.items.map((item: ITrack) => {
                return {
                    label: this.formatTimeLabel(item.timestamp, `HH:mm`),
                    fullDate: this.formatTimeLabel(item.timestamp, `M/DD/YYYY, h:mm:ss a`),
                    timestamp: item.timestamp,
                    batteryOrVolts: this.prepareBatteryOrVoltsData(this.isCableKitConnected ? item.volts : item.battery),
                    temperature: item.temperature
                };
            });

            // console.log(points);
        }

        this.chartData = {};

        setTimeout(() => {

            this.chartData.batteryOrVolts = points.map(item => {
                return {
                    sortTime: new Date(item.timestamp).getDate(),
                    batteryOrVolts: item.temperature
                }
            })
            .sort((a, b) =>
                a.sortTime > b.sortTime ? -1 : b.sortTime > a.sortTime ? 1 : 0
            );

            this.chartData.temperature = points.map(item => {
                return {
                    sortTime: new Date(item.timestamp).getDate(),
                    temperature: item.temperature
                }
            })
            .sort((a, b) =>
                a.sortTime > b.sortTime ? -1 : b.sortTime > a.sortTime ? 1 : 0
            );
        }, 100);
    }

    private groupBy(kind: string) {

        const by  = [];
        const raw = {};

        this.groupedBy   = kind;
        this.pointsTotal = this.data.items.length;

        this.data.items.forEach((item: ITrack) => {

            let token;

            if (kind === 'day') {

                token = momentTimezone.tz(item.timestamp, this.timeZone).format('MMM, DD');

            } else {

                token = momentTimezone.tz(item.timestamp, this.timeZone).format('h a');
            }

            if (!raw[token]) raw[token] = [];

            raw[token].push({
                batteryOrVolts: this.isCableKitConnected ? item.volts : item.battery,
                temperature: item.temperature
            });
        });

        for (const token in raw) {

            if (raw.hasOwnProperty(token)) {

                let batteryOrVoltsTotal = 0;
                let batteryOrVoltsSum   = 0;

                let temperatureTotal = 0;
                let temperatureSum   = 0;

                raw[token].forEach((item) => {

                    if (/\d+\.?\d?/.test(item.batteryOrVolts)) {

                        batteryOrVoltsSum += +item.batteryOrVolts;
                        batteryOrVoltsTotal++;

                    } else if (item.battery === 'L' || item.battery === 'K') {

                        batteryOrVoltsSum += 100;
                        batteryOrVoltsTotal++;
                    }

                    if (typeof item.temperature === 'number') {

                        temperatureSum += item.temperature;
                        temperatureTotal++;
                    }
                });

                by.push({
                    label: token,
                    batteryOrVolts: batteryOrVoltsTotal > 0 ? Math.floor(batteryOrVoltsSum / batteryOrVoltsTotal) : null,
                    temperature: temperatureTotal > 0 ? Math.floor(temperatureSum / temperatureTotal) : null
                });
            }
        }

        return by;
    }

    private formatTimeLabel(dateTime: string, outFormat: string, format?: string) {

        return momentTimezone(moment.utc(dateTime, format)).tz(this.timeZone).format(outFormat);
    }

    private prepareBatteryOrVoltsData(batteryOrVolts: any) {

        if (/\d+\.?\d?/.test(batteryOrVolts)) {

            return +batteryOrVolts;

        } else if (batteryOrVolts === 'L' || batteryOrVolts === 'K') {

            return 100;
        }
    }
}
