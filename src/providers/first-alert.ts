import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseProvider } from './base';
import { ApiProvider } from './api';
import { IFirstAlert } from './device';


@Injectable()
export class FirstAlertProvider extends BaseProvider {


    constructor(public http: HttpClient) {

        super(http, 'first-alert');
    }

    /**
     * Get Unrecognized alerts
     */
    public getFirstAlerts(): Promise<{ items: IFirstAlert[] }> {
        return this.http
            .get(ApiProvider.obtainRequestUrl('first-alerts/unrecognized'), ApiProvider.obtainRequestOptions())
            .toPromise() as any;
    }
}
