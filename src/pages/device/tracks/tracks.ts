import { Component, OnInit } from '@angular/core';
import { AlertPage } from '../alert/alert';
import { Refresher, LoadingController, NavParams, NavController } from 'ionic-angular';
import { IPagination } from '../../../providers/base';
import { AlertsPopoverPage } from './popover';
import { Logger } from '../../../providers/logger';
import { IDevice, ITrack } from '../../../providers/device';
import { TrackProvider } from '../../../providers/track';
import { TrackPage } from './track';

@Component({
    selector: 'page-tracks',
    templateUrl: 'tracks.html'
})
export class DeviceTracksPage implements OnInit {

    public tracks: ITrack[] = [];

    private device: IDevice;

    private pagination: IPagination;
    private pageLimit = 30;

    private highlightedTrack: ITrack;

    constructor(private logger: Logger,
                private params: NavParams,
                private loadingCtrl: LoadingController,
                private navCtrl: NavController,
                private trackProvider: TrackProvider) {

        this.device = this.params.get('device');
    }

    public ngOnInit() {

        this.loadTracks({pagination: {page: 1, limit: this.pageLimit}});
    }

    public doRefresh(refresher: Refresher) {

        this.loadTracks({pagination: {page: 1, limit: this.pageLimit}}, refresher);
    }

    public doInfinite(infiniteScroll) {

        if (this.pagination.nextPage) {

            this.trackProvider.getList(this.device.id, {
                pagination: {
                    page: this.pagination.nextPage,
                    limit: this.pageLimit
                }
            }).then((data: any) => {

                data.items.forEach((item) => {

                    let found = false;

                    this.tracks.forEach((track) => {

                        if (track.id === item.id) {

                            found = true;
                        }
                    });

                    if (!found) {

                        this.tracks.push(item);
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

    public openTrackPage(track: ITrack) {

        this.highlightedTrack = track;

        this.navCtrl.push(TrackPage, {track});
    }

    public isHighlighted(track: ITrack) {

        return (this.highlightedTrack && this.highlightedTrack.id === track.id);
    }

    public isNumber(val) {

        return typeof val === 'number';
    }

    public isNumeric(val) {

        return /^\d+$/.test(val);
    }

    private loadTracks(options, refresher?: Refresher) {

        const loader = this.loadingCtrl.create({content: `Loading tracks`});

        // noinspection JSIgnoredPromiseFromCall
        loader.present();

        this.trackProvider.getList(this.device.id, options).then((data: any) => {

            // noinspection JSIgnoredPromiseFromCall
            loader.dismiss();

            if (refresher) refresher.complete();

            this.tracks     = data.items;
            this.pagination = data.pagination;

        }).catch((err) => {
            // noinspection JSIgnoredPromiseFromCall
            loader.dismiss();
            if (refresher) refresher.complete();
            this.logger.error(err);
        });
    }
}
