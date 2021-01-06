import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Logger } from './logger';
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { BehaviorSubject } from 'rxjs/Rx';

import * as moment from 'moment';

const SETTINGS_STORAGE_TOKEN = 'settings';

const DAY_THEME_CLASS = 'day-theme';
const NIGHT_THEME_CLASS = 'night-theme';

export interface IRington {
    Name: string;
    Url: string;
}

export interface INightMode {
    enabled: boolean;
    start: string;
    end: string;
}

export interface ISettings {
    mapReloadInterval: number;
    lastOpenedDeviceId?: string;

    newTrackRingtone?: IRington;
    nightMode: INightMode;
    clusterizeDeviceMap: boolean;
    bucketPointLoading: boolean;

    showDeviceDebug: boolean;

    temperatureFormat: 'C' | 'F';
}

const defaultSettings: ISettings = {
    mapReloadInterval: 30000,
    nightMode: {
        enabled: false,
        start: '21:00',
        end: '05:00'
    },
    temperatureFormat: 'C',
    clusterizeDeviceMap: false,
    bucketPointLoading: false,
    showDeviceDebug: false
};

@Injectable()
export class Settings {

    public settings: Observable<ISettings>;

    private settingsSource: ReplaySubject<ISettings> = new ReplaySubject(1);

    private theme: BehaviorSubject<string> = new BehaviorSubject(DAY_THEME_CLASS);

    private currentTheme: string = DAY_THEME_CLASS;

    public storageSettings() {
        return this.storage.get(SETTINGS_STORAGE_TOKEN);
    }

    constructor(private storage: Storage,
                private logger: Logger) {

        this.settings = this.settingsSource.asObservable();
    }

    public init() {

        // this.storage.remove(SETTINGS_STORAGE_TOKEN); // Drop settings

        this.storage.get(SETTINGS_STORAGE_TOKEN).then((settings: ISettings) => {

            if (!settings) {

                settings = defaultSettings;
            }

            if (!settings.nightMode || typeof settings.nightMode.enabled !== 'boolean') {

                settings.nightMode = defaultSettings.nightMode;
            }

            if (typeof settings.bucketPointLoading !== 'boolean') {

                settings.bucketPointLoading = defaultSettings.bucketPointLoading;
            }

            this.settingsSource.next(settings);

            this.checkDayNight();

            setInterval(() => {
                this.checkDayNight();
            }, 1000);

        }).catch((err) => {
            this.logger.error(err);
        });
    }

    public convertTemperature() {
        this.storageSettings().then((config) => {
            this.saveSettings({
                ...config,
                temperatureFormat: config.temperatureFormat === 'F' ? 'C' : 'F'
            });
        });
    }

    public saveSettings(settings: ISettings) {

        this.storage.set(SETTINGS_STORAGE_TOKEN, settings).then(() => {
            this.settingsSource.next(settings);
        }).catch((err) => {
            this.logger.error(err);
        });
    }

    public getActiveTheme() {

        return this.theme.asObservable();
    }

    private checkDayNight() {

        this.settings.take(1).subscribe((settings) => {

            let nightMode = false;

            function minutesOfDay(m) {

                return m.minutes() + m.hours() * 60;
            }

            if (settings.nightMode.enabled) {

                const start = moment(settings.nightMode.start, 'HH:mm a');
                const end = moment(settings.nightMode.end, 'HH:mm a');

                // console.log(start);
                // console.log(end);
                // console.log(`${start} - ${end}`);
                // console.log(`${moment()}`);

                const currentMinutesOfDay = minutesOfDay(moment());
                const startMinutesOfDay = minutesOfDay(start);
                const endMinutesOfDay = minutesOfDay(end);

                // console.log(`${currentMinutesOfDay}: ${startMinutesOfDay} - ${endMinutesOfDay}`);

                if (currentMinutesOfDay < endMinutesOfDay || currentMinutesOfDay > startMinutesOfDay) {

                    nightMode = true;
                }

                // console.log(`Night mode enabled: ${this.settings.nightMode.enabled}`);
                // console.log(`Night mode: ${nightMode}`);
            }

            let newTheme;

            if (nightMode) {

                newTheme = NIGHT_THEME_CLASS;

            } else {

                newTheme = DAY_THEME_CLASS;
            }

            if (this.currentTheme !== newTheme) {

                this.currentTheme = newTheme;

                this.theme.next(newTheme);
            }
        });
    }
}
