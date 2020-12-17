import { Component } from '@angular/core';
import { NavParams } from 'ionic-angular';
import { IAlert } from '../../providers/alert';
import { ITrack } from '../../../../providers/device';
import { TrackProvider } from '../../../../providers/track';

@Component({
    selector: 'page-track',
    templateUrl: 'track.html'
})
export class TrackPage {

    public track: ITrack;

    constructor(private params: NavParams) {

        this.track = this.params.get('track');
    }

    public getTrackMapUrl() {

        return TrackProvider.getTrackMapUrl(this.track, {
            resolution: '640x320',
            zoom: 17
        });
    }

    public isNumber(val) {

        return typeof val === 'number';
    }

    public isNumeric(val) {

        return /^\d+$/.test(val);
    }
}
