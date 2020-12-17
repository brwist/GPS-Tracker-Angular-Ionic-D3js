import { Injectable, Injector } from '@angular/core';
import { IonicErrorHandler } from 'ionic-angular';
import { Logger } from './logger';

import * as StackTrace from 'stacktrace-js';
import * as Sentry from '@sentry/browser';

@Injectable()
export class GlobalErrorHandler extends IonicErrorHandler {

    constructor(private injector: Injector) {

        super();
    }

    public handleError(error) {
        super.handleError(error);

        const logger  = this.injector.get(Logger);
        const message = error.message ? error.message : error.toString();

        // get the stack trace, lets grab the last 10 stacks only
        StackTrace.fromError(error).then((stackFrames) => {
            const stackString = stackFrames
                .splice(0, 20)
                .map((sf) => {
                    return sf.toString();
                }).join('\n');

            logger.trackError(message + '\n\n' + stackString);

            const eventId = Sentry.captureException(error.originalError || error);
            // Sentry.showReportDialog({ eventId });
        });

        throw error;
    }
}
