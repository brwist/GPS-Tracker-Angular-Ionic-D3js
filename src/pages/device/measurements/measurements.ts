import { Component } from '@angular/core';
import { LoadingController, NavController, NavParams, Refresher } from 'ionic-angular';
import { BaseComponent } from '../../../app/base-component';
import { IPagination } from '../../../providers/base';
import { IDevice, IMeasurement } from '../../../providers/device';
import { Logger } from '../../../providers/logger';
import { MeasurementProvider } from '../../../providers/measurement';
import { ISettings, Settings } from '../../../providers/settings';

@Component({
    selector: 'measurements',
    templateUrl: 'measurements.html'
})
export class MeasurementsPage extends BaseComponent {
    public measurements: IMeasurement[] = [];
    public settings: ISettings;

    public device: IDevice;

    private pagination: IPagination;
    private pageLimit = 30;

    constructor(
        private logger: Logger,
        private params: NavParams,
        private loadingCtrl: LoadingController,
        private navCtrl: NavController,
        private measurementProvider: MeasurementProvider,
        public settingsProvider: Settings
    ) {

        super();

        this.sub = this.settingsProvider.settings.subscribe((settings: ISettings) => {
            this.settings = settings;
        });

        this.device = this.params.get('device');
    }

    public ngOnInit() {
        this.loadMeasurements({ pagination: { page: 1, limit: this.pageLimit } });
    }

    public doRefresh(refresher: Refresher) {
        this.loadMeasurements({ pagination: { page: 1, limit: this.pageLimit } }, refresher);
    }

    public doInfinite(infiniteScroll) {

        if (this.pagination.nextPage) {
            this.measurementProvider.getList(this.device.id, {
                pagination: {
                    page: this.pagination.nextPage,
                    limit: this.pageLimit
                }
            }).then((data) => {

                data.items.forEach((item) => {

                    let found = false;

                    this.measurements.forEach((meas) => {
                        if (meas.id === item.id) {
                            found = true;
                        }
                    });

                    if (!found) {

                        this.measurements.push(item);
                    }
                });

                this.pagination = data.pagination;

                infiniteScroll.complete();

            }).catch((err) => {
                this.logger.error(err);
            });

        } else {

            infiniteScroll.complete();
        }
    }

    private loadMeasurements(options, refresher?: Refresher) {

        const loader = this.loadingCtrl.create({ content: `Loading measurements` });

        loader.present();

        this.measurementProvider.getList(this.device.id, options).then((data: any) => {

            loader.dismiss();

            if (refresher) refresher.complete();

            this.measurements = data.items;
            this.pagination = data.pagination;

        }).catch((err) => {
            loader.dismiss();
            if (refresher) refresher.complete();
            this.logger.error(err);
        });
    }
}
