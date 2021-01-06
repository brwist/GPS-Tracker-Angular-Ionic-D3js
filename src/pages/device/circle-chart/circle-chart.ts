import { Component, Input } from '@angular/core';
import { BaseComponent } from '../../../app/base-component';
import { IMeasurement } from '../../../providers/device';
import { ISettings, Settings } from '../../../providers/settings';

@Component({
    selector: 'device-circle-chart',
    templateUrl: 'circle-chart.html'
})
export class DeviceCircleChartPage extends BaseComponent {
    @Input()
    public measurement: IMeasurement;
    /** user settings */
    public settings;

    constructor(
        public settingsProvider: Settings
    ) {

        super();

        this.sub = this.settingsProvider.settings.subscribe((settings: ISettings) => {
            this.settings = settings;
        });
    }
}
