import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Subject, Observable} from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import {
    Push,
    PushObject,
    PushOptions,
    RegistrationEventResponse,
    NotificationEventResponse
} from '@ionic-native/push';
import {JwtHelper} from 'angular2-jwt';
import {ReplaySubject} from 'rxjs';
import {Platform, AlertController, ModalController} from 'ionic-angular';
import {Storage} from '@ionic/storage';
import {TrackingOptionsPage} from '../pages/device/tracking-options';
import {Logger} from './logger';
import * as io from 'socket.io-client';
import {ITrack} from './device';
import {UniqueDeviceID} from '@ionic-native/unique-device-id';

declare const window: any;

export const API_INFO = {

    // Local testing
    // PROTOCOL: 'http',
    // HOST: 'localhost',
    // PORT: 4100

    // HOST: '192.168.2.28' // Kow
    // HOST: '192.168.1.33', // a
    // HOST: '192.168.1.104', // f
    // PORT: 4100,

    // HOST: '185.22.62.160', // test server
    // PORT: 8080

    // HOST: '40.121.84.142', // Staging

    // Production
    PROTOCOL: 'https',
    HOST: 'trakkit.zedly.us',
    PORT: 443
};

export interface ISignUpData {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    password: string;
    passwordConfirmation: string;
    platform?: string;
}

export interface IAuthData {
    username: string;
    password: string;
}

export interface IUser {
    id: string;
    email: string;
    phone: string;
}

export interface IUserInfo {
    id: string;
    firstName: string;
    lastName: string;
    timeZone: string;
    email: string;
    phone: string;
    emails: IExtraEmail[];
    phones: IExtraPhone[];
    emailVerified: boolean;
    phoneVerified: boolean;
}

export interface IChangeEmailData {
    newEmail: string;
}

export interface IChangePhoneData {
    newPhone: string;
}

export interface IExtraEmail {
    value: string;
    status: string;
}

export interface IExtraPhone {
    value: string;
    status: string;
}

export interface IAddExtraEmailData {
    email: string;
}

export interface IRemoveExtraEmailData {
    email: string;
}

export interface IAddExtraPhoneData {
    phone: string;
}

export interface IRemoveExtraPhoneData {
    phone: string;
}

export interface IChangePasswordData {
    currentPassword: string;
    password: string;
    passwordConfirmation: string;
}

export interface IApiRequestOptions {
    pagination?: IPaginationOptions;
    action?: string;
    filter?: IFilterItem;
    select?: string[];
    lean?: boolean;
    mapBounds?: any;
    clusterize?: boolean;
    clusterizeMinLimit?: number;
    zoom?: number;
    bucketSize?: number;
    bucketNumber?: number;
}

interface IFilterItem {
    [key: string]: any;
}

export interface IPaginationOptions {
    page: number;
    limit: number;
}

export interface IVersion {
    title: string;
    description: string;
    tag: string;
    url: string;
    md5: string;
    updatedAt: string;
}

export interface IFirmwareUpdateInfo {
    updateAvailable: boolean;
    version?: IVersion;
}

export interface IRecoverAccessData {
    email: string;
}

export interface IDeviceLocation {
    id: string;
    lastTrack: ITrack;
    lastLocation: ITrack;
}

let localToken;

@Injectable()
export class ApiProvider {

    public static obtainRequestUrl(path: string, id?: string, options?: IApiRequestOptions): string {

        if (typeof id === 'object') {

            options = id;
            id = null;
        }

        let url = `${API_INFO.PROTOCOL}://${API_INFO.HOST}`;

        if (API_INFO.PORT) {

            url += `:${API_INFO.PORT}`;
        }

        url += `/v1/${path}`;

        if (id) {

            url += `/${id}`;
        }

        const urlParams = [];

        if (options) {

            if (options.action) {

                url += `/${options.action}`;
            }

            if (options.pagination) {

                if (options.pagination.page) {

                    urlParams.push({name: 'page', value: options.pagination.page});
                }

                if (options.pagination.limit) {

                    urlParams.push({name: 'limit', value: options.pagination.limit});
                }
            }

            if (options.filter) {

                Object.keys(options.filter).forEach((filterName: string) => {

                    urlParams.push({name: `filter[${filterName}]`, value: options.filter[filterName]});
                });
            }

            if (options.mapBounds) {

                urlParams.push({name: 'filter[mapBounds][southWest][lat]', value: options.mapBounds.southWest.lat});
                urlParams.push({name: 'filter[mapBounds][southWest][lng]', value: options.mapBounds.southWest.lng});
                urlParams.push({name: 'filter[mapBounds][northEast][lat]', value: options.mapBounds.northEast.lat});
                urlParams.push({name: 'filter[mapBounds][northEast][lng]', value: options.mapBounds.northEast.lng});
            }

            if (options.select) {

                options.select.forEach((param) => {
                    urlParams.push({name: `select[]`, value: param});
                });
            }

            if (options.lean) {

                urlParams.push({name: `lean`, value: 'true'});
            }

            if (typeof options.clusterize !== 'undefined') {

                urlParams.push({name: `clusterize`, value: options.clusterize});
            }

            if (typeof options.clusterizeMinLimit !== 'undefined') {

                urlParams.push({name: `clusterizeMinLimit`, value: options.clusterizeMinLimit});
            }

            if (options.zoom) {

                urlParams.push({name: `zoom`, value: options.zoom});
            }

            if (options.bucketSize) {

                urlParams.push({name: `bucketSize`, value: options.bucketSize});
            }

            if (typeof options.bucketNumber === 'number') {

                urlParams.push({name: `bucketNumber`, value: options.bucketNumber});
            }
        }

        if (urlParams.length > 0) {

            const paramsArr = [];

            urlParams.forEach((urlParam) => {

                paramsArr.push(`${urlParam.name}=${urlParam.value}`);
            });

            url += `?${paramsArr.join('&')}`;
        }

        return url;
    }

    public static obtainRequestOptions(): any {

        const headersObject: any = {'Content-Type': 'application/json'};

        if (localToken) {

            headersObject.Authorization = `Bearer ${localToken}`;
        }

        return {headers: new HttpHeaders(headersObject)};
    }

    private userSource: ReplaySubject<IUserInfo> = new ReplaySubject<IUserInfo>(1);

    private tokenModel: string;
    private userModel: IUserInfo;

    private jwtHelper: JwtHelper = new JwtHelper();

    private pushObject: PushObject;

    private errorSubject = new Subject<any>();

    private pushNotificationSubject = new Subject<any>();
    private firstAlertSource: Subject<{ deviceId: string }> = new Subject<{ deviceId: string }>();

    private deviceLocationSource: ReplaySubject<IDeviceLocation> = new ReplaySubject<IDeviceLocation>(1);

    private socket: any;

    constructor(public http: HttpClient,
                public platform: Platform,
                public storage: Storage,
                public push: Push,
                public logger: Logger,
                private alertCtrl: AlertController,
                private modalCtrl: ModalController,
                private uniqueDeviceID: UniqueDeviceID) {

        // -
    }

    set token(token) {

        localToken = this.tokenModel = token;

        this.storage.set('token', token)
            .catch((err) => {

                this.logger.error(`token(set): ${err.message}`);
            });
    }

    get token() {

        return this.tokenModel;
    }

    set user(user: any) {

        this.userModel = user;

        this.userSource.next(user);
    }

    get user() {

        return this.userSource.asObservable();
    }

    get isAuthenticated() {

        return !!this.token;
    }

    get deviceLocation() {

        return this.deviceLocationSource.asObservable();
    }

    get firstAlert() {
        return this.firstAlertSource.asObservable();
    }

    get isOnline() {

        return Observable.merge(
            Observable.fromEvent(window, 'offline').map(() => false),
            Observable.fromEvent(window, 'online').map(() => true),
            Observable.create((sub) => {
                sub.next(navigator.onLine);
                sub.complete();
            })
        );
    }

    public init() {

        return this.fetchToken();
    }

    public suspend() {

        if (this.socket) {

            this.socket.close();
        }
    }

    public pushInit() {

        const pushOptions: PushOptions = {
            android: {
                senderID: '183146379735',
                clearBadge: true
            },
            ios: {
                alert: true,
                badge: true,
                clearBadge: true,
                sound: true,
                categories: {
                    rule: {
                        yes: {
                            callback: 'gpsTrackerApp.track',
                            title: 'Track',
                            foreground: true,
                            destructive: false
                        },
                        no: {
                            callback: 'gpsTrackerApp.cancel',
                            title: 'Ok',
                            foreground: true,
                            destructive: false
                        }
                    }
                }
            },
            windows: {}
        };

        window.gpsTrackerApp = window.gpsTrackerApp || {};

        window.gpsTrackerApp.track = (data) => {

            console.log('track data: ');
            console.log(data);

            this.pushObject.finish().then(() => {

                console.log('track callback finished');

                this.modalCtrl.create(TrackingOptionsPage, {id: data.additionalData.deviceId}).present();

            }).catch((err) => {
                console.log('track callback failed');
                console.log(err);
            });
        };

        window.gpsTrackerApp.cancel = (data) => {

            console.log('cancel data: ');
            console.log(data);

            this.pushObject.finish().then(() => {
                console.log('cancel callback finished');
            }).catch((err) => {
                console.log('cancel callback failed');
                console.log(err);
            });
        };

        this.pushObject = this.push.init(pushOptions);

        // this.pushObject.hasPermission().then(isEnabled => {
        //
        //     console.log(`PUSH permissions:`);
        //     console.log(isEnabled);
        //
        // }).catch((err) => {
        //     console.log(`PUSH ERR:`);
        //     console.log(err);
        // });

        this.pushObject.on('registration').subscribe((data: RegistrationEventResponse) => {

            // console.log('PUSH REGISTRATION:');
            // console.log(data);

            if (data.registrationId) {

                this.uniqueDeviceID.get()
                    .then((uuid: any) => {

                        // Example
                        // iPhone: 1AF2A790-761F-47DC-BEEC-5FD4D4FBCD0D
                        // Android: 6c80a729-1f27-f588-3595-940803139428
                        // Android (no read phone state permission): {androidID: "6c80a7291f27f588"}

                        if (typeof uuid === 'object' && uuid && typeof uuid.androidID === 'string') {

                            uuid = uuid.androidID;
                        }

                        // console.log(`uniqueDeviceID: ${uuid}`);

                        const addPushDeviceData = {
                            platform: this.platform.is('ios') ? 'ios' : this.platform.is('android') ? 'android' : null,
                            deviceToken: data.registrationId,
                            uniqueDeviceID: uuid
                        };

                        this.http
                            .put(ApiProvider.obtainRequestUrl('push_devices'),
                                JSON.stringify(addPushDeviceData),
                                Object.assign({responseType: 'text'}, ApiProvider.obtainRequestOptions()))
                            .toPromise()
                            .then(() => {
                                this.logger.debug('PUSH device registered');
                            })
                            .catch((err) => this.handleApiError(err));
                    })
                    .catch((err) => this.handleApiError(err));

            } else {
                this.logger.error('no registrationId');
            }
        });

        this.pushObject.on('notification').subscribe((data: NotificationEventResponse) => {

            // console.log('PUSH NOTIFICATION RECEIVED:');
            // console.log(data);

            // Let's drop these type of notifications....it requires User Action. Just post to Notification Bar.
            // if (data.additionalData.notificationType === 'rule') {
            //
            //     this.alertCtrl.create({
            //         title: `Device Rule triggered`,
            //         message: data.message,
            //         buttons: [{
            //             text: 'OK',
            //             role: 'cancel'
            //         }, {
            //             text: 'Track',
            //             cssClass: 'track-dialogue-button',
            //             handler: () => {
            //
            //                 this.modalCtrl.create(TrackingOptionsPage, {id: data.additionalData.deviceId}).present();
            //             }
            //         }]
            //     }).present();
            // }

            this.pushNotificationSubject.next(data);
        });

        this.pushObject.on('error').subscribe((err: any) => {
            this.logger.error(`PUSH error: ${err}`);
        });
    }

    public createSession(authData: IAuthData) {

        return this.http
            .put(ApiProvider.obtainRequestUrl('sessions'), JSON.stringify(authData), ApiProvider.obtainRequestOptions())
            .toPromise()
            .then((data: any) => {
                this.authSuccess(data.token);
                return this.user;
            })
            .catch((err) => this.handleApiError(err));
    }

    public updateUserInfo(user: IUserInfo): Promise<void | IUserInfo> {

        return this.http
            .post(ApiProvider.obtainRequestUrl('users', user.id), JSON.stringify(user), ApiProvider.obtainRequestOptions())
            .toPromise()
            .then((data: any) => {
                this.user = data;
                return data;
            })
            .catch((err) => {
                this.handleApiError(err);
            });
    }

    public signUp(signUpData: ISignUpData) {

        signUpData.platform = this.platform.is('ios') ? 'ios' : 'android';

        return this.http
            .put(ApiProvider.obtainRequestUrl('users'),
                JSON.stringify(signUpData), ApiProvider.obtainRequestOptions())
            .toPromise()
            .then(() => {

                return this.createSession({
                    username: signUpData.email,
                    password: signUpData.password
                });
            })
            .catch((err) => this.handleApiError(err));
    }

    public logOut() {

        this.token = null;
        this.user = null;

        if (this.socket) {

            this.socket.disconnect();
        }

        // Clear device location events buffer
        // It's a fix for 550 (Permission Denied) error after account change
        this.deviceLocationSource = new ReplaySubject<IDeviceLocation>(1);
    }

    public fetchUserInfo(): Promise<void | IUserInfo> {

        return this.http
            .get(ApiProvider.obtainRequestUrl('users', this.jwtHelper.decodeToken(this.token).id),
                ApiProvider.obtainRequestOptions())
            .toPromise()
            .then((data: any) => {
                this.user = data;
                return data;
            })
            .catch((err) => {
                this.handleApiError(err);
            });
    }

    public changePassword(changePasswordData: IChangePasswordData) {

        return this.http
            .post(ApiProvider.obtainRequestUrl('users/change-password'),
                JSON.stringify(changePasswordData), ApiProvider.obtainRequestOptions())
            .toPromise()
            .catch((err) => {
                this.handleApiError(err);
            });
    }

    public changeEmail(changeEmailData: IChangeEmailData) {

        return this.http
            .post(ApiProvider.obtainRequestUrl('users/change-email-initiate'),
                JSON.stringify(changeEmailData), ApiProvider.obtainRequestOptions())
            .toPromise()
            .catch((err) => {
                this.handleApiError(err);
            });
    }

    public changePhone(changePhoneData: IChangePhoneData) {

        return this.http
            .post(ApiProvider.obtainRequestUrl('users/change-phone-initiate'),
                JSON.stringify(changePhoneData), ApiProvider.obtainRequestOptions())
            .toPromise()
            .catch((err) => {
                this.handleApiError(err);
            });
    }

    public addExtraEmail(addExtraEmailData: IAddExtraEmailData) {

        return this.http
            .post(ApiProvider.obtainRequestUrl('users/add-extra-email'),
                JSON.stringify(addExtraEmailData), Object.assign({responseType: 'text'}, ApiProvider.obtainRequestOptions()))
            .toPromise()
            .catch((err) => {
                this.handleApiError(err);
            });
    }

    public removeExtraEmail(removeExtraEmailData: IRemoveExtraEmailData) {

        return this.http
            .post(ApiProvider.obtainRequestUrl('users/remove-extra-email'),
                JSON.stringify(removeExtraEmailData), Object.assign({responseType: 'text'}, ApiProvider.obtainRequestOptions()))
            .toPromise()
            .catch((err) => {
                this.handleApiError(err);
            });
    }

    public addExtraPhone(addExtraPhoneData: IAddExtraPhoneData) {

        return this.http
            .post(ApiProvider.obtainRequestUrl('users/add-extra-phone'),
                JSON.stringify(addExtraPhoneData), Object.assign({responseType: 'text'}, ApiProvider.obtainRequestOptions()))
            .toPromise()
            .catch((err) => {
                this.handleApiError(err);
            });
    }

    public removeExtraPhone(removeExtraPhoneData: IRemoveExtraPhoneData) {

        return this.http
            .post(ApiProvider.obtainRequestUrl('users/remove-extra-phone'),
                JSON.stringify(removeExtraPhoneData), Object.assign({responseType: 'text'}, ApiProvider.obtainRequestOptions()))
            .toPromise()
            .catch((err) => {
                this.handleApiError(err);
            });
    }

    public checkForFirmwareUpdate(currentVersion: string): any {

        return this.http
            .get(ApiProvider.obtainRequestUrl(`check-update/${currentVersion}`), ApiProvider.obtainRequestOptions())
            .toPromise()
            .catch((err) => {
                this.handleApiError(err);
            });
    }

    public recoverAccess(recoverAccessData: IRecoverAccessData) {

        return this.http
            .post(ApiProvider.obtainRequestUrl('users/recover-password'),
                JSON.stringify(recoverAccessData), ApiProvider.obtainRequestOptions())
            .toPromise()
            .catch((err) => {
                this.handleApiError(err);
            });
    }

    public apiError(): Observable<any> {

        return this.errorSubject.asObservable();
    }

    public pushNotification(): Observable<any> {

        return this.pushNotificationSubject.asObservable();
    }

    private authSuccess(token) {

        this.token = token;

        this.fetchUserInfo().catch((err) => {
            this.logger.error(err);
        });

        this.initSocketIo();
    }

    private fetchToken() {

        return this.storage.get('token')
            .then((data) => {

                if (!data) {

                    console.log('Token not exists!');

                    this.storage.remove('token').catch((err) => {
                        console.log(err);
                    });

                    this.user = null;

                    return null;
                }

                if (this.jwtHelper.isTokenExpired(data)) {

                    console.log('Token is expired!');

                    this.storage.remove('token').catch((err) => {
                        console.log(err);
                    });

                    this.user = null;

                    return null;
                }

                // console.log(`Token exists ${data}`);

                localToken = this.tokenModel = data;

                this.fetchUserInfo().catch((err) => {
                    this.logger.error(err);
                });

                this.initSocketIo();

                return localToken;

            }).catch((err) => {
                console.log(err);
                return null;
            });
    }

    private initSocketIo() {

        if (!this.socket) {

            let apiUrl = `${API_INFO.PROTOCOL}://${API_INFO.HOST}`;

            if (API_INFO.PORT) {

                apiUrl += `:${API_INFO.PORT}`;
            }

            this.socket = io(apiUrl);

            this.socket.on('connect', () => {

                this.socket
                    .emit('authenticate', {token: localToken})
                    .on('authenticated', () => {

                        this.logger.debug('Socket.io: Authenticated');

                        this.socket.on('deviceLocation', (data) => {

                            this.deviceLocationSource.next(data);
                        });

                        this.socket.on('firstAlert', (data) => this.firstAlertSource.next(data));

                        this.fetchUserInfo().catch(() => {
                            // Ignore
                        });
                    })
                    .on('unauthorized', (msg) => {
                        this.logger.info('Unauthorized: ' + JSON.stringify(msg.data));
                        throw new Error(msg.data.type);
                    });
            });

            this.socket.on('disconnect', () => {

                this.socket.removeListener('authenticated');
                this.socket.removeListener('unauthorized');
                this.socket.removeListener('deviceLocation');
                this.socket.removeListener('firstAlert');

                // Clear device location events buffer
                // @moved to logout method
                // this.deviceLocationSource = new ReplaySubject<IDeviceLocation>(1);

                // this.socket = null;

                this.logger.debug(`initSocketIo: Socket io disconnected`);
            });

        } else {

            this.socket.connect();
        }
    }

    private handleApiError(err: any) {

        this.errorSubject.next(err);

        throw err;
    }
}
