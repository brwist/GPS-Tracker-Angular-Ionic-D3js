import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseProvider } from './base';
import { IDevice } from './device';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import { ApiProvider } from './api';

export interface INotificationData {
    title: string;
}

export interface INotification {
    id: string;
    data: INotificationData;
    device: IDevice;
    seen: boolean;
    createdAt: Date;
}

@Injectable()
export class NotificationProvider extends BaseProvider {

    constructor(public http: HttpClient) {

        super(http, 'notifications');
    }

    public markAsSeen(id: string) {

        return this
            .applyActionV2(ApiProvider.obtainRequestUrl(`notifications/${id}/mark-as-seen`));
    }

    public markAsSeenAll() {

        return this
            .applyActionV2(ApiProvider.obtainRequestUrl(`notifications/mark-as-seen-all`));
    }

    public clearAll() {

        return this
            .applyActionV2(ApiProvider.obtainRequestUrl(`notifications/remove-all`));
    }
}
