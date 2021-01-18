import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseProvider } from './base';
import { ApiProvider } from './api';
import { IAbstractNotification } from '../app/notifications/notification-factory';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import { BehaviorSubject } from 'rxjs';

export interface ILocation {
    coordinates: number[];
}

export type DeviceType = 'THS' | 'GPS';

export interface ITrack {
    id: string;
    location?: ILocation;
    altitude: number;
    direction: number;
    speed: number;
    motion: number;
    battery: string;
    timestamp: string;
    gpsTime?: string;
    volts: number;
    temperature: number;
    ntc1: number;
    ntc2: number;
    ntc3: number;
    source: number;
    gy1?: 'L' | 'H';
    iconUrl?: string;
    createdAt: string;
}

export interface IMeasurement {
    id: string;
    temperature: number;
    humidity: number;
    battery: number;
    createdAt: any;
}

export interface IDevice {
    id?: string;
    name?: string;
    description?: string;
    mac?: string;
    battery?: string;
    motion?: string;
    temperature?: number;
    firmware?: string;
    trackingOptions?: ITrackingOptions;
    lastTrack?: ITrack;
    lastMeasurement?: IMeasurement;
    lastSeen?: string;
    code?: IDeviceCode;
    sharedWith?: ISharedWith[];
    sharedAccess?: boolean;
    firstAlert?: IFirstAlert;
    type: DeviceType;
}

export interface IFirstAlert {
    enabled: boolean;
    dismiss: boolean;
    email?: string;
    phone?: string;
    hours?: number;
    seenAfter?: number;
    deviceId?: string;
    deviceName?: string;
}

export interface ISharedWith {
    user: { id: string; email: string };
    createdAt: string;
}

export interface IDeviceCode {
    value: number;
    createdAt: string;
}

export interface ITrackingOptions {
    intervalInMs?: number;
    notifications: IAbstractNotification[];
}

export const statusCodes = [{
    value: 1,
    name: 'WiFi Tracking (Default)'
}, {
    value: 5,
    name: 'GPS Tracking'
}, {
    value: 4,
    name: 'GPS Logging'
}, {
    value: 3,
    name: 'Locate'
}];

export const TYPES = ['GPS', 'THS'];

export interface SelectedRange {
    start: number;
    end: number;
}

@Injectable()
export class DeviceProvider extends BaseProvider {
    private zoomChangeTemp = new BehaviorSubject<any>(undefined);
    $zoomChangeTemp = this.zoomChangeTemp.asObservable();

    private zoomChangeVolt = new BehaviorSubject<any>(undefined);
    $zoomChangeVolt = this.zoomChangeVolt.asObservable();

    private zoomDateRange = new BehaviorSubject<string>(undefined);
    $zoomDateRange = this.zoomDateRange.asObservable();

    public static codeToString(code: number) {

        switch (code) {
            case 1:
                return 'WiFi Tracking (Default)';
            case 2:
                return 'New';
            case 3:
                return 'Locate';
            case 4:
                return 'GPS Logging';
            case 5:
                return 'GPS Tracking';
            default:
                return 'Unknown';
        }
    }

    constructor(public http: HttpClient) {

        super(http, 'devices');
    }

    public getLastLocation(id): Promise<ITrack> {

        return this.getItemV2(ApiProvider.obtainRequestUrl(`device/${id}/tracks/last-location`));
    }

    public setStatusCode(device: IDevice, code: number) {

        return this.applyActionV2(ApiProvider.obtainRequestUrl(`devices/${device.id}/set-status-code`), { code });
    }

    public share(device: IDevice, email: string, firstName: string) {

        return this.applyActionV2(ApiProvider.obtainRequestUrl(`devices/${device.id}/share-device`), {
            email,
            firstName
        });
    }

    public stopSharing(device: IDevice, email: string) {

        return this.applyActionV2(ApiProvider.obtainRequestUrl(`devices/${device.id}/stop-sharing-device`), {
            email
        });
    }

    public zoomedTemp(event) {
        this.zoomChangeTemp.next(event);
    }

    public zoomedVolt(event) {
        this.zoomChangeVolt.next(event);
    }

    public setSelectedRange(type: string) {
        this.zoomDateRange.next(type);
    }

    /**
     * Custom api req to dismiss alert
     * @param id - device id
     */
    public dismissFirstAlerts(id: string) {
        return this.http
            .post(
                ApiProvider.obtainRequestUrl(`devices/${id}/first-alert/dismiss`),
                {},
                { responseType: 'text', ...ApiProvider.obtainRequestOptions() }
            )
            .toPromise()
            .catch((err) => this.handleApiError(err));
    }
}
