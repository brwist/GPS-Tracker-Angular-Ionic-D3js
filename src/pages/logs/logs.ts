import { Component } from '@angular/core';
import { Analytics } from '../../providers/analytics';
import { Logger } from '../../providers/logger';

@Component({
    templateUrl: 'logs.html',
    selector: 'logs-app-page'
})
export class LogsPage {

    public title: string = 'Logs';

    constructor(private logger: Logger) {

    }

    public get logs() {

        return this.logger.logs;
    }

    public levelString(level) {

        return Logger.levels[level];
    }
}
