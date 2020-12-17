import { Component } from '@angular/core';
import { NotificationPage } from '../notification/notification';
import { NavParams, ViewController } from 'ionic-angular';
import * as momentTimezone from 'moment-timezone';

@Component({
    selector: 'page-timezone-picker',
    templateUrl: 'timezone-picker.html'
})
export class TimeZonePickerPage {

    public timeZone: any;

    public timezones: any[];

    public deviceTimeZone = {
        name: momentTimezone.tz.guess()
    };

    private callback: (ringtone) => void;

    private allTimeZones: any[];

    constructor(private params: NavParams,
                private viewCtrl: ViewController) {

    }

    public ngOnInit() {

        this.callback = this.params.get('callback');
        this.timeZone = this.params.get('timeZone');

        this.timezones = this.allTimeZones = momentTimezone.tz.names().map((name) => {
            return {
                name,
                offset: momentTimezone().tz(name).format('Z')
            };
        }).sort((a, b) => {
            if (a.name > b.name) return 1;
            if (a.name < b.name) return -1;
            return 0;
        });
    }

    public selectTimeZone(value) {

        this.timeZone = value.name;
    }

    public refineTimeZones(ev) {

        const value = ev.target.value;

        if (value && value.trim() !== '') {

            this.timezones = this.allTimeZones.filter((tz) => {

                return (tz.name.toLowerCase().indexOf(value.toLowerCase()) > -1);
            });

        } else {

            this.timezones = this.allTimeZones;
        }
    }

    public save() {

        this.callback(this.timeZone);

        this.viewCtrl.dismiss();
    }

    public dismiss() {

        this.viewCtrl.dismiss();
    }
}
