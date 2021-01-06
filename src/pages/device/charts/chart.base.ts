import { OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import * as async from 'async';
import { ModalController } from 'ionic-angular';
import * as moment from 'moment';
import * as momentTimezone from 'moment-timezone';
import { BaseComponent } from '../../../app/base-component';
import { ApiProvider, IUserInfo } from '../../../providers/api';
import { IDevice } from '../../../providers/device';
import { Logger } from '../../../providers/logger';
import { DateSettingsPage } from '../date-settings';
import { IDateSettings } from '../device';

const DATE_SETTINGS_STORAGE_KEY = 'device-date-settings-for-charts';
const MAX_ITEMS_PER_DAY_STORAGE_KEY = 'max-items-per-day';

interface IChartType {
    value: string;
    label: string;
}

export abstract class ChartBase extends BaseComponent implements OnInit {

    protected abstract device: IDevice;
    protected abstract chartTypes: IChartType[];

    protected groupedBy: string;
    protected pointsTotal: number;

    protected maxNumberOfPointsModel: number | string;

    private _dateSettings: Partial<IDateSettings> = {
        type: 'day',
        value: 'today',
        startDate: moment(),
        endDate: moment()
    };

    get dateSettings() {
        return this._dateSettings;
    }

    set dateSettings(value) {
        this._dateSettings = {
            ...this._dateSettings,
            ...value
        };

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
    }

    protected timeZone: string = momentTimezone.tz.guess();
    protected startDate: any;
    protected endDate: any;

    constructor(
        protected logger: Logger,
        protected storage: Storage,
        protected modalCtrl: ModalController,
        protected apiProvider: ApiProvider
    ) {
        super();
    }

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

    public ngOnInit() {

        async.series([(callback) => {

            this.storage.get(DATE_SETTINGS_STORAGE_KEY).then((dateSettings?: IDateSettings) => {

                if (dateSettings) {

                    this.dateSettings = dateSettings;

                    if (this.dateSettings.type !== 'custom') {

                        const updatedDateRange = DateSettingsPage.getDateRange(this.dateSettings.value);

                        if (updatedDateRange) {
                            this.dateSettings = {
                                startDate: updatedDateRange.startDate,
                                endDate: updatedDateRange.endDate
                            };
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

        this.sub = this.apiProvider.user.subscribe((user: IUserInfo) => {

            if (user && user.timeZone) {

                this.timeZone = user.timeZone;
            }
        });
    }

    protected abstract loadChartData();
    protected abstract renderCharts();
    protected abstract groupBy(kind: string);

    protected formatTimeLabel(dateTime: string, outFormat: string, format?: string) {
        return momentTimezone(moment.utc(dateTime, format)).tz(this.timeZone).format(outFormat);
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
}
