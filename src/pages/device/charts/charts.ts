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
    public activeTab = 1;
    public rangeDateStart: any;
    public rangeDateEnd: any;
    public datePipeFormat = 'MMM d h:mm a';
    private data: any;

    private dataYear: any;

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
    private firstLoad = true;
    private yearSelected = false;
    yearPoints: any;

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
        this.storage.set(MAX_ITEMS_PER_DAY_STORAGE_KEY, "All").then(() => {

            this.maxNumberOfPointsModel = "All";

            this.renderCharts();

        }).catch((err) => {
            this.logger.error(err);
        });
        async.series([(callback) => {

            this.storage.get(DATE_SETTINGS_STORAGE_KEY).then((dateSettings?: IDateSettings) => {

                if (dateSettings) {

                    this.dateSettings = dateSettings;

                    if (this.dateSettings.type !== 'custom') {

                        const updatedDateRange = DateSettingsPage.getDateRange(this.dateSettings.value);

                        if (updatedDateRange) {
                            this.dateSettings.startDate = updatedDateRange.startDate;
                            this.dateSettings.endDate   = moment(updatedDateRange.endDate).add(1, 'hours');
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

    get isCableKitConnected() {

        return this.device.lastTrack && this.device.lastTrack.battery === 'K';
    }

    private loadChartData() {
        this.firstLoad = true;
        if(moment(this.dateSettings.startDate).isSame(this.dateSettings.endDate)) {
            this.dateSettings.startDate = moment(this.dateSettings.startDate).add(-1, 'hours');
        }
        
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

        // this.rangeDateStart = moment(this.startDate);
        // this.rangeDateEnd = moment(this.endDate);

        var duration = moment.duration(this.endDate.diff(this.startDate));
        var hours = duration.asHours();
        if(hours === 1) {
            this.getHourData(select);
        } else if(!this.yearSelected){
            this.trackProvider.getListForChart(this.device.id, {
                filter: {
                    startDate:
                        encodeURIComponent(momentTimezone(this.startDate).tz(this.timeZone).format()),
                    endDate:
                        encodeURIComponent(momentTimezone(this.endDate).tz(this.timeZone).format())
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
        } else {
            this.renderCharts();
        }
        if(!this.yearSelected && !this.dataYear)  {
            this.loadChartYear();
        }
    }

    private getHourData(select) {
        this.trackProvider.getListForChart(this.device.id, {
            filter: {
                startDate:
                    encodeURIComponent(momentTimezone(this.startDate).tz(this.timeZone).startOf('date').format('YYYY-MM-DD HH:mm:ss')),
                endDate:
                    encodeURIComponent(momentTimezone(this.endDate).tz(this.timeZone).endOf('date').format('YYYY-MM-DD HH:mm:ss'))
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

    private loadChartYear() {
        const currentTime = moment().format();
        const start = moment(currentTime).add(-1, 'year');
        const end = moment(currentTime);
        const select = ['timestamp', 'temperature', 'ntc1'];

        if (this.isCableKitConnected) {

            select.push('volts');

        } else {

            select.push('battery');
        }
        
            this.trackProvider.getListForChart(this.device.id, {
                filter: {
                    startDate:
                        encodeURIComponent(momentTimezone(start).tz(this.timeZone).format()),
                    endDate:
                        encodeURIComponent(momentTimezone(end).tz(this.timeZone).format())
                },
                select,
                lean: true
            }).then((data: any) => {

                this.dataYear = data;
                this.yearPoints = data.items.map((item: ITrack) => {
                    return {
                        timestamp: item.timestamp,
                        batteryOrVolts: this.prepareBatteryOrVoltsData(this.isCableKitConnected ? item.volts : item.battery),
                        temperature: item.temperature
                    };
                });
                if (this.isCableKitConnected) {

                    let ntcIsValid = false;

                    for (const item of this.dataYear.items) {

                        if (/\d+\.?\d?/.test(item.ntc1)) {

                            ntcIsValid = true;

                            break;
                        }
                    }

                    if (ntcIsValid) {

                        this.dataYear.items = this.dataYear.items.map((item) => {

                            item.temperature = item.ntc1;

                            return item;
                        });
                    }
                }

            }).catch((err) => {
                this.logger.error(err);
            });
        
    }

    private renderCharts() {
        if(this.yearSelected) {
            this.loadData(this.dataYear, this.yearPoints);
        } else {
            this.loadData(this.data);
        }
    }

    loadData(data, yearPoints?) {
        let points;
        if(!data) {
            return;
        }

        this.groupedBy = null;
        if(!this.yearSelected) {
            points = data.items.map((item: ITrack) => {
                return {
                    timestamp: item.timestamp,
                    batteryOrVolts: this.prepareBatteryOrVoltsData(this.isCableKitConnected ? item.volts : item.battery),
                    temperature: item.temperature
                };
            });
        } else {
            points = yearPoints;
        }

        this.chartData = {};
        setTimeout(() => {
            this.chartData.batteryOrVolts = points.map(item => {
                return {
                    sortTime: new Date(item.timestamp),
                    batteryOrVolts: item.batteryOrVolts
                }
            })
            .sort((a, b) =>
                a.sortTime > b.sortTime ? -1 : b.sortTime > a.sortTime ? 1 : 0
            );

            this.chartData.temperature = points.map(item => {
                return {
                    sortTime: new Date(item.timestamp),
                    temperature: item.temperature
                }
            })
            .sort((a, b) =>
                a.sortTime > b.sortTime ? -1 : b.sortTime > a.sortTime ? 1 : 0
            );
            setTimeout(() => {
                this.firstLoad = false;
            }, 4000);
        }, 100);
    }

    rangeTabChange(e) {
        // if(!this.firstLoad) {
        //     this.activeTab = e;
        // }
    }

    rangeTimeChange(event) {
        this.rangeDateStart = moment(event.start).isValid() ? moment(event.start) : undefined;
        this.rangeDateEnd = moment(event.end).isValid() ? moment(event.end) : undefined;
    }

    public selectTimeDurationHour(tab) {
        this.datePipeFormat = 'MMM d h:mm a';
        this.yearSelected = false;
        this.activeTab = tab;
        const currentTime = moment().format();
        const start = moment(currentTime).add(-1, 'hours');
        const end = moment(currentTime);
        this.dateSettings.startDate = start;
        this.dateSettings.endDate = end;
        this.storage.set(DATE_SETTINGS_STORAGE_KEY, this.dateSettings).catch((err) => {
            this.logger.error(err);
        });
        this.rangeDateStart = start;
        this.rangeDateEnd = end;
        this.loadChartData();
    }

    public selectTimeDurationDay(tab) {
        this.datePipeFormat = 'MMM d h:mm a';
        this.yearSelected = false;
        this.activeTab = tab;
        const currentTime = moment().format();
        const start = moment(currentTime).add(-1, 'day');
        const end = moment(currentTime);
        this.dateSettings.startDate = start;
        this.dateSettings.endDate = end;
        this.storage.set(DATE_SETTINGS_STORAGE_KEY, this.dateSettings).catch((err) => {
            this.logger.error(err);
        });
        this.rangeDateStart = start;
        this.rangeDateEnd = end;

        this.loadChartData();
    }

    public selectTimeDurationWeek(tab) {
        this.datePipeFormat = 'MMM d h:mm a';
        this.yearSelected = false;
        this.activeTab = tab;
        const currentTime = moment().format();
        const start = moment(currentTime).add(-1, 'week');
        const end = moment(currentTime);
        this.dateSettings.startDate = start;
        this.dateSettings.endDate = end;
        this.storage.set(DATE_SETTINGS_STORAGE_KEY, this.dateSettings).catch((err) => {
            this.logger.error(err);
        });
        this.rangeDateStart = start;
        this.rangeDateEnd = end;

        this.loadChartData();
    }

    public selectTimeDurationMonth(tab) {
        this.datePipeFormat = 'MMM d h:mm a';
        this.yearSelected = false;
        this.activeTab = tab;
        const currentTime = moment().format();
        const start = moment(currentTime).add(-1, 'month');
        const end = moment(currentTime);
        this.dateSettings.startDate = start;
        this.dateSettings.endDate = end;
        this.storage.set(DATE_SETTINGS_STORAGE_KEY, this.dateSettings).catch((err) => {
            this.logger.error(err);
        });
        this.rangeDateStart = start;
        this.rangeDateEnd = end;

        this.loadChartData();
    }

    public selectTimeDurationYear(tab) {
        this.datePipeFormat = 'MMM d, y, h:mm a';
        this.yearSelected = true;
        this.activeTab = tab;
        const currentTime = moment().format();
        const start = moment(currentTime).add(-1, 'year');
        const end = moment(currentTime);
        this.dateSettings.startDate = start;
        this.dateSettings.endDate = end;
        this.storage.set(DATE_SETTINGS_STORAGE_KEY, this.dateSettings).catch((err) => {
            this.logger.error(err);
        });
        this.rangeDateStart = start;
        this.rangeDateEnd = end;

        this.loadChartData();
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
