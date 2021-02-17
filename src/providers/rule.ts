import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseProvider } from './base';
import { ApiProvider } from './api';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import { DeviceType } from './device';

export interface IRule {
    id?: string;
    name: string;
    enabled: boolean;
    devices: string[];
    conditions?: any;
    actions?: any[];
    explanation?: string;
    deviceType: DeviceType;
}

@Injectable()
export class RuleProvider extends BaseProvider {

    constructor(public http: HttpClient) {

        super(http, `rules`);
    }

    public removeAll() {

        return this
            .applyActionV2(ApiProvider.obtainRequestUrl(`${this.resource}/remove-all`));
    }
}
