import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseProvider } from './base';
import { IDevice } from './device';
import { IRule } from './rule';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import { ApiProvider } from './api';

export interface IAlert {
    id: string;
    rule: IRule;
    device: IDevice;
    conditions: any;
    seen: boolean;
    alerts: IAlert[];
    multipleAlerts: boolean;
    createdAt: Date;
}

@Injectable()
export class AlertProvider extends BaseProvider {

    constructor(public http: HttpClient) {

        super(http, 'alerts');
    }

    public markAsSeen(id: string) {

        return this
            .applyActionV2(ApiProvider.obtainRequestUrl(`alerts/${id}/mark-as-seen`));
    }

    public markAsSeenAll() {

        return this
            .applyActionV2(ApiProvider.obtainRequestUrl(`alerts/mark-as-seen-all`));
    }

    public clearAll() {

        return this
            .applyActionV2(ApiProvider.obtainRequestUrl(`alerts/remove-all`));
    }
}
