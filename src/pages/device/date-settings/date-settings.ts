import { Component } from '@angular/core';
import { NavParams, Segment, ViewController } from 'ionic-angular';
import { EmailNotificationPage } from './common/notifications/email';
import { PushNotificationPage } from './common/notifications/push';
import { WebPushNotificationPage } from './common/notifications/web-push';
import { SmsNotificationPage } from './common/notifications/sms';
import { IDateSettings } from '../device';
import { Logger } from '../../../providers/logger';

import * as moment from 'moment';

declare const datePicker: any;

@Component({
    selector: 'date-settings',
    templateUrl: 'date-settings.html'
})
export class DateSettingsPage {

    public static getDateRange(value: string) {

        const data: any = {};

        switch (value) {
            case 'today':
                data.startDate = moment();
                data.endDate   = moment();
                break;
            case 'yesterday':
                data.startDate = moment().subtract(1, 'days');
                data.endDate   = moment().subtract(1, 'days');
                break;
            case 'last3Days':
                data.startDate = moment().subtract(2, 'days');
                data.endDate   = moment();
                break;
            case 'last7Days':
                data.startDate = moment().subtract(6, 'days');
                data.endDate   = moment();
                break;
            case 'last14Days':
                data.startDate = moment().subtract(13, 'days');
                data.endDate   = moment();
                break;
            case 'thisWeek':
                data.startDate = moment().startOf('isoWeek');
                data.endDate   = moment().endOf('isoWeek');
                break;
            case 'lastWeek':
                data.startDate = moment().subtract(1, 'weeks').startOf('isoWeek');
                data.endDate   = moment().subtract(1, 'weeks').endOf('isoWeek');
                break;
            case 'last30Days':
                data.startDate = moment().subtract(29, 'days');
                data.endDate   = moment();
                break;
            case 'last60Days':
                data.startDate = moment().subtract(59, 'days');
                data.endDate   = moment();
                break;
            case 'last90Days':
                data.startDate = moment().subtract(89, 'days');
                data.endDate   = moment();
                break;
            case 'thisMonth':
                data.startDate = moment().startOf('month');
                data.endDate   = moment().endOf('month');
                break;
            case 'lastMonth':
                data.startDate = moment().subtract(1, 'months').startOf('month');
                data.endDate   = moment().subtract(1, 'months').endOf('month');
                break;
            default:
                console.log(`DateSettingsPage::getDateRange: unexpected value: ${value}`);
                return null;
        }

        return data;
    }

    public dateSettings: IDateSettings;

    public yesterday = moment().subtract(1, 'day').format('dddd, MMM D');
    public today     = moment().format('dddd, MMM D');
    public last3Days = moment().subtract(2, 'days').format('MMM D') + ' - ' + moment().format('MMM D');

    public last7Days  = moment().subtract(6, 'days').format('MMM D') + ' - ' + moment().format('MMM D');
    public last14Days = moment().subtract(13, 'days').format('MMM D') + ' - ' + moment().format('MMM D');

    public thisWeek = moment().startOf('isoWeek').format('MMM D') + ' - ' + moment().endOf('isoWeek').format('MMM D');
    public lastWeek = moment().subtract(1, 'weeks').startOf('isoWeek').format('MMM D') + ' - ' +
        moment().subtract(1, 'weeks').endOf('isoWeek').format('MMM D');

    public last30Days = moment().subtract(29, 'days').format('MMM D') + ' - ' + moment().format('MMM D');
    public last60Days = moment().subtract(59, 'days').format('MMM D') + ' - ' + moment().format('MMM D');
    public last90Days = moment().subtract(89, 'days').format('MMM D') + ' - ' + moment().format('MMM D');

    public thisMonth = moment().format('MMMM');
    public lastMonth = moment().subtract(1, 'months').format('MMMM');

    private callback: (dateSettings: IDateSettings) => void;

    constructor(private params: NavParams,
                private logger: Logger,
                private viewCtrl: ViewController) {

    }

    public ngOnInit() {

        this.dateSettings = this.params.get('dateSettings');

        this.callback = this.params.get('callback');
    }

    public segmentChanged(segment: Segment) {

        switch (segment.value) {
            case 'day':
                this.setDateRange('today');
                break;
            case 'week':
                this.setDateRange('last7Days');
                break;
            case 'month':
                this.setDateRange('last30Days');
                break;
            case 'custom':
                delete this.dateSettings.value;
                break;
            default:
                this.logger.error(`DateSettingsPage::segmentChanged: unexpected type: ${segment.value}`);
        }
    }

    public setDateRange(value: string) {

        const dateRange = DateSettingsPage.getDateRange(value);

        if (!dateRange) {
            this.logger.error(`DateSettingsPage::setDate: unexpected value: ${value}`);
            return;
        }

        this.dateSettings.value     = value;
        this.dateSettings.startDate = dateRange.startDate;
        this.dateSettings.endDate   = dateRange.endDate;
    }

    get dateStart() {

        if (this.dateSettings.startDate && moment(this.dateSettings.startDate).isValid()) {

            return moment(this.dateSettings.startDate).format('YYYY-MM-DD');

        } else {

            this.logger.warning(`SET:dateStart: Invalid date: "${this.dateSettings.startDate}"`);

            return moment().subtract(1, 'day').format('YYYY-MM-DD');
        }
    }

    set dateStart(value) {

        const date = moment(value);

        if (date.isValid()) {

            this.dateSettings.startDate = date;

        } else {

            this.logger.warning(`SET:dateStart: Invalid date: "${value}"`);
        }
    }

    get dateEnd() {

        if (this.dateSettings.endDate && moment(this.dateSettings.endDate).isValid()) {

            return moment(this.dateSettings.endDate).format('YYYY-MM-DD');

        } else {

            this.logger.warning(`SET:dateEnd: Invalid date: "${this.dateSettings.endDate}"`);

            return moment().format('YYYY-MM-DD');
        }
    }

    set dateEnd(value) {

        const date = moment(value);

        if (date.isValid()) {

            this.dateSettings.endDate = date;

        } else {

            this.logger.warning(`SET:dateEnd: Invalid date: "${value}"`);
        }
    }

    public selectCustomDateStart() {

        datePicker.show({
            date: moment(this.dateSettings.startDate).toDate(),
            mode: 'date',
            androidTheme: datePicker.ANDROID_THEMES.THEME_DEVICE_DEFAULT_LIGHT
        }, (date) => {

            this.logger.info('Selected startDate: ' + date);

            this.dateStart = date;

        }, (error) => {

            this.logger.error('Selected startDate. Error: ' + error);
        });
    }

    public selectCustomDateEnd() {

        datePicker.show({
            date: moment(this.dateSettings.endDate).toDate(),
            mode: 'date',
            androidTheme: datePicker.ANDROID_THEMES.THEME_DEVICE_DEFAULT_LIGHT
        }, (date) => {

            this.logger.info('Selected endDate: ' + date);

            this.dateEnd = date;

        }, (error) => {

            this.logger.error('Selected endDate. Error: ' + error);
        });
    }

    public save() {

        this.callback(this.dateSettings);

        this.viewCtrl.dismiss();
    }

    public dismiss() {

        this.viewCtrl.dismiss();
    }
}
