import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ApiProvider} from './api';
import {Subject, Observable} from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

export interface IPagination {
    totalItems: number;
    totalPages: number;
    itemsPerPage: number;
    currentPage: number;
    nextPage: number;
    prevPage: number;
}

export interface ISorting {
    sortingField: string;
    sortingOrder: string;
}

@Injectable()
export class BaseProvider {

    private errorSubject = new Subject<any>();

    constructor(public http: HttpClient,
                public resource: string) {

    }

    public addItem(item: any): Promise<any> {

        return this.http
            .put(ApiProvider.obtainRequestUrl(this.resource), JSON.stringify(item), ApiProvider.obtainRequestOptions())
            .toPromise()
            .catch((err) => this.handleApiError(err));
    }

    public getList(options): Promise<any> {

        return this.http
            .get(ApiProvider.obtainRequestUrl(this.resource, options), ApiProvider.obtainRequestOptions())
            .toPromise()
            .then((data: any) => {
                return {
                    items: data.items,
                    pagination: {
                        totalItems: data.totalItems,
                        totalPages: data.totalPages,
                        itemsPerPage: data.itemsPerPage,
                        currentPage: data.currentPage,
                        nextPage: data.nextPage,
                        prevPage: data.prevPage
                    }
                };
            })
            .catch((err) => this.handleApiError(err));
    }

    public getListV2(url: string): Promise<any> {

        return this.http
            .get(url, ApiProvider.obtainRequestOptions())
            .toPromise()
            .then((data: any) => {
                return {
                    items: data.items,
                    byDay: data.byDay,
                    isBatteryTypeIsK: data.isBatteryTypeIsK,
                    pagination: {
                        totalItems: data.totalItems,
                        totalPages: data.totalPages,
                        itemsPerPage: data.itemsPerPage,
                        currentPage: data.currentPage,
                        nextPage: data.nextPage,
                        prevPage: data.prevPage
                    }
                };
            })
            .catch((err) => this.handleApiError(err));
    }

    public getItem(id): Promise<any> {

        return this.http
            .get(ApiProvider.obtainRequestUrl(this.resource, id), ApiProvider.obtainRequestOptions())
            .timeout(15000)
            .toPromise()
            .catch((err) => this.handleApiError(err));
    }

    public getItemV2(url: string): Promise<any> {

        return this.http
            .get(url, ApiProvider.obtainRequestOptions())
            .timeout(15000)
            .toPromise()
            .catch((err) => this.handleApiError(err));
    }

    public updateItem(item: any): Promise<any> {

        return this.http
            .post(ApiProvider.obtainRequestUrl(this.resource, item.id), JSON.stringify(item),
                ApiProvider.obtainRequestOptions())
            .timeout(15000)
            .toPromise()
            .catch((err) => this.handleApiError(err));
    }

    public applyAction(id: string, action: string, data?: any): Promise<any> {

        return this.http
            .post(ApiProvider.obtainRequestUrl(this.resource, id, {action}), JSON.stringify(data || {}),
                Object.assign(ApiProvider.obtainRequestOptions(), {responseType: 'text'}))
            .timeout(15000)
            .map((res: any) => {
                if (res) return res.json();
                return null;
            })
            .toPromise()
            .catch((err) => this.handleApiError(err));
    }

    public applyActionV2(url: string, data?: any): Promise<any> {

        return this.http
            .post(url, data, Object.assign(ApiProvider.obtainRequestOptions(), {responseType: 'text'}))
            .timeout(15000)
            .map((res: any) => {
                if (res) {
                    if (typeof res === 'string') {
                        try {
                            return JSON.parse(res);
                        } catch (err) {
                            return res;
                        }
                    } else {
                        return res.json();
                    }
                }
                return null;
            })
            .toPromise()
            .catch((err) => this.handleApiError(err));
    }

    public removeItem(id) {

        return this.http
            .delete(ApiProvider.obtainRequestUrl(this.resource, id), ApiProvider.obtainRequestOptions())
            .timeout(15000)
            .toPromise()
            .catch((err) => this.handleApiError(err));
    }

    public apiError(): Observable<any> {

        return this.errorSubject.asObservable();
    }

    public handleApiError(err: any) {

        this.errorSubject.next(err);

        throw err;
    }
}
