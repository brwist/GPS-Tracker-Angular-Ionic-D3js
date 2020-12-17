import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiProvider } from './api';
import { Router } from '@angular/router';
import { BaseProvider } from './base';
import { ITrack } from './device';
import { UtilsService } from '../services/utils.service';

export interface IByDay {
    day: string;
    ntc1?: number;
    battery?: number;
    temperature?: number;
    batteryMin?: number;
    batteryMax?: number;
    temperatureMin?: number;
    temperatureMax?: number;
    ntc1Min?: number;
    ntc1Max?: number;
}

export const trackSources = {
    TRACK_SOURCE_OPEN_WIFI_TINY: 5,
    TRACK_SOURCE_CELLULAR_ASSIST: 6,
    TRACK_SOURCE_CELLULAR_TRAKKIT: 7,
    TRACK_SOURCE_HOME_WIFI: 8,
    TRACK_SOURCE_OPEN_WIFI_FULL: 9,
    TRACK_SOURCE_HOME_WIFI_GPS_LOG: 10
};

@Injectable()
export class TrackProvider extends BaseProvider {

    public static getTrackMapUrl(track: ITrack, options: any) {

        if (!track.location) {

            return 'https://trakkit.us/assets/img/no-location.png';
        }

        let url = `https://maps.googleapis.com/maps/api/staticmap?zoom=${options.zoom}&size=${options.resolution}&maptype=roadmap`;

        if (track.source === trackSources.TRACK_SOURCE_HOME_WIFI) {

            url += `&markers=color:0x7FD228`;

        } else if (track.source === trackSources.TRACK_SOURCE_HOME_WIFI_GPS_LOG) {

            url += `&markers=color:black`;

        } else {

            const pointColor = UtilsService.getPointColor(track.location.coordinates);

            // Statement: Track with a long number have no direction (even if is reported)
            // It this should be a blue circle since it is a long number of lat/lon

            if (typeof track.direction === 'number' && pointColor === 'red') {

                const angle   = track.direction;
                const iconUrl =
                          `https://trakkit.us/assets/img/direction-icons/gps-direction-${pointColor}-${angle}.ico`;

                url += `&markers=icon:${iconUrl}%7Canchor:center`;

            } else {

                url += `&markers=color:${pointColor}`;
            }
        }

        url += `%7C${track.location.coordinates[1]},${track.location.coordinates[0]}`;

        url += `&key=${'AIzaSyB5skgCHwHNsAf0EFz2vOmebPsG_F1Wml0'}`;

        return url;
    }

    constructor(public http: HttpClient) {

        super(http, `device/dummy/tracks`);
    }

    public getList(deviceId, options?: any) {

        return super.getListV2(ApiProvider.obtainRequestUrl(`device/${deviceId}/tracks`, options));
    }

    public getListForChart(deviceId, options?: any) {

        return this.getListV2(ApiProvider.obtainRequestUrl(`device/${deviceId}/tracks-for-chart`, options));
    }

    public getListForSmallChart(deviceId, options?: any) {

        return this.getListV2(ApiProvider.obtainRequestUrl(`device/${deviceId}/tracks-for-small-chart`, options));
    }

    public getListForMap(deviceId, options?: any) {

        return this.http
            .get(ApiProvider.obtainRequestUrl(`device/${deviceId}/tracks-for-map-v3`, options), ApiProvider.obtainRequestOptions())
            .toPromise()
            .catch((err) => this.handleApiError(err));
    }

    public getListForMapByBuckets(deviceId, options?: any) {

        return this.http
            .get(ApiProvider.obtainRequestUrl(`device/${deviceId}/tracks-for-map-v4`, options), ApiProvider.obtainRequestOptions())
            .toPromise()
            .catch((err) => this.handleApiError(err));
    }

    public getTrack(deviceId, id): Promise<any> {

        return this.http
            .get(ApiProvider.obtainRequestUrl(`device/${deviceId}/tracks`, id), ApiProvider.obtainRequestOptions())
            .toPromise()
            .catch((err) => this.handleApiError(err));
    }
}
