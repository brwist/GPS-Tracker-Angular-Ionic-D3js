import { Injectable } from '@angular/core';
import { Platform, AlertController } from 'ionic-angular';
// import { Firebase } from '@ionic-native/firebase';

import * as StackTrace from 'stacktrace-js';

declare const window: any;

const MAX_NUMBER_OF_LOGS = 1000;

const levels = [
    'error',
    'warning',
    'notice',
    'info',
    'debug'
];

export interface IUserErrorAlertOption {
    title?: string;
    message: string;
    buttonText?: string;
}

@Injectable()
export class Logger {

    public static levels = levels;

    public logs: any[] = [];

    private logLevel: number;

    constructor(private platform: Platform,
                // private firebase: Firebase,
                private alertCtrl: AlertController) {

    }

    /**
     * Init logger
     *
     * @param options
     * @param options.logLevel
     */
    public init(options) {

        this.logLevel = options.logLevel;

        if (!window._LTracker) {

            window._LTracker = [];
        }

        window._LTracker.push({
            logglyKey: '412f2607-e223-451b-b78c-9173b36f0da0',
            sendConsoleErrors: true,
            tag: 'loggly-jslogger'
        });
    }

    get isCordovaAvailable() {

        return this.platform.is('cordova');
    }

    public error(msg: any) {

        const logLevel = levels.indexOf('error');

        if (this.logLevel < logLevel) return;

        // get the stack trace, lets grab the last 10 stacks only
        StackTrace.fromError(new Error()).then((stackFrames) => {
            const stackString = stackFrames
                .splice(0, 20)
                .map((sf) => {
                    return sf.toString();
                }).join('\n');

            const errorMessage = this.getErrorMessage(msg);

            this.doWrite({
                level: logLevel,
                message: errorMessage + '\n\n' + stackString
            });

            this.trackError(errorMessage);
        });
    }

    public warning(msg: any) {

        const logLevel = levels.indexOf('warning');

        if (this.logLevel < logLevel) return;

        this.doWrite({
            level: logLevel,
            message: this.getErrorMessage(msg)
        });
    }

    public notice(msg: any) {

        const logLevel = levels.indexOf('notice');

        if (this.logLevel < logLevel) return;

        this.doWrite({
            level: logLevel,
            message: this.getErrorMessage(msg)
        });
    }

    public info(msg: any) {

        const logLevel = levels.indexOf('info');

        if (this.logLevel < logLevel) return;

        this.doWrite({
            level: logLevel,
            message: this.getErrorMessage(msg)
        });
    }

    public debug(msg: any) {

        const logLevel = levels.indexOf('debug');

        if (this.logLevel < logLevel) return;

        this.doWrite({
            level: logLevel,
            message: this.getErrorMessage(msg)
        });
    }

    public showErrorAlert(options: IUserErrorAlertOption) {

        this.alertCtrl.create({
            title: options.title || `Error`,
            message: options.message,
            buttons: [options.buttonText || `Ok`]
        }).present();
    }

    public trackError(text) {

        if (this.isCordovaAvailable) {

            console.log(`Logger::trackError: ${text}`);
            // this.firebase.logEvent('error', text).catch((err) => {
            //     console.log(err);
            // });

        } else {

            console.log(`DEBUG: trackException: ${text}}`);
        }
    }

    /**
     * Write log
     *
     * @param options
     * @param options.level
     * @param options.message
     */
    private doWrite(options) {

        const now = new Date();

        const timeStamp = now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds() + '.' + now.getMilliseconds();

        const logMessage = `${timeStamp}: ${levels[options.level].toUpperCase()}: ${options.message}`;

        console.log(logMessage);

        this.logs.push({
            timeStamp,
            level: options.level,
            message: options.message
        });

        if (this.logs.length > MAX_NUMBER_OF_LOGS) {

            this.logs = this.logs.slice(this.logs.length - MAX_NUMBER_OF_LOGS, MAX_NUMBER_OF_LOGS);
        }

        window._LTracker.push(logMessage);
    }

    private getErrorMessage(e): string {
        const errorStrings = ['' + e];
        const delimiter    = '\n';

        if (typeof e === 'undefined') {
            return errorStrings.join(delimiter);
        }
        if (e === null) {
            return errorStrings.join(delimiter);
        }
        if (e instanceof Date) {
            return errorStrings.join(delimiter);
        }
        if (e instanceof Error) {
            errorStrings[0] = e.toString();
            if (e.stack) {
                errorStrings[1] = 'Stack trace';
                errorStrings[2] = e.stack;
            }
            return errorStrings.join(delimiter);
        }
        if (typeof e === 'object' || e instanceof Object) {
            const inspection = JSON.stringify(e, null, 2);
            if (inspection.length < 55) {
                errorStrings[0] = inspection;
                return errorStrings.join(delimiter);
            }
            if (typeof e.toString !== 'undefined') {
                errorStrings[0] = e.toString();
            }
            errorStrings[1] = 'Inspected object';
            errorStrings[2] = inspection;
        }

        return errorStrings.join(delimiter);
    }
}
