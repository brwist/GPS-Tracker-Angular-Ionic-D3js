import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiProvider } from './api';
import { BaseProvider } from './base';
import { IMeasurement } from './device';

@Injectable()
export class MeasurementProvider extends BaseProvider {

    constructor(public http: HttpClient) {

        super(http, `device/dummy/measurements`);
    }

    public getList(deviceId, options?: any): Promise<{ pagination: any, items: IMeasurement[] }> {
        return super.getListV2(ApiProvider.obtainRequestUrl(`device/${deviceId}/measurements`, options));
    }

    public getListForChart(deviceId, options?: any) {
        options.filter = {
            ...options.filter,
            sortingField: 'createdAt',
            sortingOrder: 'desc'
        };

        options.pagination = { page: 1, limit: 999999 };

        return super.getListV2(ApiProvider.obtainRequestUrl(`device/${deviceId}/measurements`, options));
    }

    public getListForSmallChart(deviceId, options?: any) {

        return this.getListV2(ApiProvider.obtainRequestUrl(`device/${deviceId}/measurements-for-small-chart`, options));
    }
}
