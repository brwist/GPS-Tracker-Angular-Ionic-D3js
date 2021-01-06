import { Component, OnDestroy, OnInit } from '@angular/core';
import { RuleProvider, IRule } from '../../../providers/rule';
import { NavController, NavParams, AlertController, ItemSliding, LoadingController } from 'ionic-angular';
import { TemperatureConditionPage } from '../common/conditions/temperature/temperature';
import { NTC1ConditionPage } from '../common/conditions/ntc1/ntc1';
import { VoltsConditionPage } from '../common/conditions/volts/volts';
import { MotionConditionPage } from '../common/conditions/motion/motion';
import { BatteryConditionPage } from '../common/conditions/battery';
import { StateChangeConditionPage } from '../common/conditions/state-change';
import { ReeferHoursConditionPage } from '../common/conditions/reefer-hours';
import { GeoZoneConditionPage } from '../common/conditions/geo-zone/geo-zone';
import { EmailActionPage } from '../common/action/email/email';
import { SmsActionPage } from '../common/action/sms/sms';
import { PushActionPage } from '../common/action/push/push';
import { WebPushActionPage } from '../common/action/web-push/web-push';
import { TemperatureCondition } from '../../../app/conditions/temperature';
import { NTC1Condition } from '../../../app/conditions/ntc1';
import { VoltsCondition } from '../../../app/conditions/volts';
import { MotionCondition } from '../../../app/conditions/motion';
import { GeoZoneCondition } from '../../../app/conditions/geo-zone';
import { EmailAction } from '../../../app/actions/email';
import { SmsAction } from '../../../app/actions/sms';
import { PushAction } from '../../../app/actions/push';
import { WebPushAction } from '../../../app/actions/web-push';
import { ConditionFactory } from '../../../app/conditions/condition-factory';
import { ActionFactory } from '../../../app/actions/action-factory';
import { BatteryCondition } from '../../../app/conditions/battery';
import { StateChangeCondition } from '../../../app/conditions/change-state';
import { ReeferHoursCondition } from '../../../app/conditions/reefer-hours';
import { DeviceProvider, IDevice, TYPES } from '../../../providers/device';
import { ApiProvider, IUserInfo } from '../../../providers/api';
import { Subscription } from 'rxjs/Subscription';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
import { Logger } from '../../../providers/logger';
import * as humanizeDuration from 'humanize-duration';
import { SpeedConditionPage } from '../common/conditions/speed/speed';
import { SpeedCondition } from '../../../app/conditions/speed';
import { HumidityConditionPage } from '../common/conditions/humidity/humidity';
import { HumidityCondition } from '../../../app/conditions/humidity';

@Component({
    selector: 'page-rule-editor',
    templateUrl: 'rule-editor.html'
})
export class RulesEditorPage implements OnInit, OnDestroy {

    public rule: IRule;

    public match: string = 'any';
    public conditions: any[] = [];
    public actions: any[] = [];

    public _devices: IDevice[] = [];
    public get devices(): IDevice[] {
        return this._devices.filter((device: IDevice) => device.type === this.rule.devicesType);
    }
    public set devices(value: IDevice[]) {
        this._devices = value;
    }

    public searchDevicesString: string;

    public deviceTypes = TYPES;

    private ruleId: string;

    private allDevices: IDevice[];

    private userSub: Subscription;
    private watchPositionSubscription: Subscription;

    private phones: string[] = [];
    private emails: string[] = [];

    private mobileDeviceLocation: any;

    constructor(
        private navCtrl: NavController,
        private ruleProvider: RuleProvider,
        private deviceProvider: DeviceProvider,
        private params: NavParams,
        private loadingCtrl: LoadingController,
        private apiProvider: ApiProvider,
        private geolocation: Geolocation,
        private logger: Logger,
        private alertCtrl: AlertController
    ) {

        this.ruleId = this.params.get('id');

        if (this.ruleId) {

            this.loadRule();

        } else {

            this.rule = {
                name: 'New rule',
                enabled: true,
                devices: [],
                devicesType: 'GPS'
            };

            if (this.params.get('deviceId')) {

                this.rule.devices = [this.params.get('deviceId')];
            }
        }

        this.deviceProvider
            .getList({ select: ['id', 'name', 'type'], pagination: { limit: 1000 } })
            .then((data: any) => {
                this.devices = data.items;
                this.allDevices = data.items;
            });
    }

    public ngOnInit() {

        this.apiProvider.fetchUserInfo();

        this.userSub = this.apiProvider.user.subscribe((user: IUserInfo) => {

            this.phones = user.phones.filter((phone) => phone.status === 'active').map((phone) => phone.value);

            if (user.phone && user.phoneVerified && this.phones.indexOf(user.phone) === -1) {

                this.phones.push(user.phone);
            }

            this.emails = user.emails.filter((email) => email.status === 'active').map((email) => email.value);

            if (user.emailVerified && this.emails.indexOf(user.email) === -1) {

                this.emails.push(user.email);
            }
        });

        this.watchPositionSubscription = this.geolocation.watchPosition().subscribe((data: Geoposition) => {

            if (!data || !data.coords) {

                this.logger.debug(`RuleEditor::ngOnInit: mobile device location is unknown`);

                return;
            }

            this.mobileDeviceLocation = data.coords;
        });
    }

    public ngOnDestroy() {

        this.userSub.unsubscribe();
        this.watchPositionSubscription.unsubscribe();
    }

    public changeType() {
        this.rule.devices = [];
        this.conditions = [];
        this.actions = [];
    }

    public matchConditionsAlertPresent() {

        const alert = this.alertCtrl.create({
            title: 'Match conditions',
            inputs: [{
                type: 'radio',
                name: 'match',
                label: 'All conditions',
                value: 'all',
                checked: this.match === 'all'
            }, {
                type: 'radio',
                name: 'match',
                label: 'Any conditions',
                value: 'any',
                checked: this.match === 'any'
            }],
            buttons: [{
                text: 'Cancel',
                role: 'cancel',
                handler: (data) => {
                    console.log('Cancel clicked');
                }
            }, {
                text: 'OK',
                handler: (data) => {
                    this.match = data;
                }
            }]
        });

        alert.present();
    }

    public addCondition() {

        const alert = this.alertCtrl.create();

        alert.setTitle('Add new condition');

        if (this.rule.devicesType === 'GPS') {

            alert.addButton({
                text: 'Geo zone',
                handler: (data) => {
                    this.navCtrl.push(GeoZoneConditionPage, {
                        mobileDeviceLocation: this.mobileDeviceLocation,
                        callback: (condition: GeoZoneCondition) => {
                            this.conditions.push(condition);
                        }
                    });
                }
            });

            alert.addButton({
                text: 'Temperature',
                handler: (data) => {
                    this.navCtrl.push(TemperatureConditionPage, {
                        callback: (condition: TemperatureCondition) => {
                            this.conditions.push(condition);
                        }
                    });
                }
            });

            alert.addButton({
                text: 'Temperature (NTC1)',
                handler: (data) => {
                    this.navCtrl.push(NTC1ConditionPage, {
                        callback: (condition: NTC1Condition) => {
                            this.conditions.push(condition);
                        }
                    });
                }
            });

            alert.addButton({
                text: 'Volt',
                handler: (data) => {
                    this.navCtrl.push(VoltsConditionPage, {
                        callback: (condition: VoltsCondition) => {
                            this.conditions.push(condition);
                        }
                    });
                }
            });

            alert.addButton({
                text: 'Speed',
                handler: (data) => {
                    this.navCtrl.push(SpeedConditionPage, {
                        callback: (condition: SpeedCondition) => {
                            this.conditions.push(condition);
                        }
                    });
                }
            });

            alert.addButton({
                text: 'Motion',
                handler: (data) => {
                    this.navCtrl.push(MotionConditionPage, {
                        callback: (condition: MotionCondition) => {
                            this.conditions.push(condition);
                        }
                    });
                }
            });

            alert.addButton({
                text: 'Battery',
                handler: (data) => {
                    this.navCtrl.push(BatteryConditionPage, {
                        callback: (condition: BatteryCondition) => {
                            this.conditions.push(condition);
                        }
                    });
                }
            });

            alert.addButton({
                text: 'US state change',
                handler: (data) => {
                    this.navCtrl.push(StateChangeConditionPage, {
                        callback: (condition: StateChangeCondition) => {
                            this.conditions.push(condition);
                        }
                    });
                }
            });

            alert.addButton({
                text: 'Reefer Hours',
                handler: (data) => {
                    this.navCtrl.push(ReeferHoursConditionPage, {
                        callback: (condition: ReeferHoursCondition) => {
                            this.conditions.push(condition);
                        }
                    });
                }
            });
        } else {
            alert.addButton({
                text: 'Temperature',
                handler: (data) => {
                    this.navCtrl.push(TemperatureConditionPage, {
                        callback: (condition: TemperatureCondition) => {
                            this.conditions.push(condition);
                        }
                    });
                }
            });

            alert.addButton({
                text: 'Battery',
                handler: (data) => {
                    this.navCtrl.push(BatteryConditionPage, {
                        callback: (condition: BatteryCondition) => {
                            this.conditions.push(condition);
                        }
                    });
                }
            });

            alert.addButton({
                text: 'Humidity',
                handler: (data) => {
                    this.navCtrl.push(HumidityConditionPage, {
                        callback: (condition: HumidityCondition) => {
                            this.conditions.push(condition);
                        }
                    });
                }
            });
        }

        alert.addButton('Cancel');

        alert.present();
    }

    public addAction() {

        const alert = this.alertCtrl.create();

        alert.setTitle('Add new action');

        alert.addButton({
            text: 'Email',
            handler: (data) => {

                if (this.emails.length === 0) {

                    this.alertCtrl.create({
                        title: 'Verify E-mail',
                        subTitle: 'At least one verified E-mail is required',
                        buttons: ['Ok']
                    }).present();

                    return;
                }

                this.navCtrl.push(EmailActionPage, {
                    emails: this.emails,
                    callback: (action: EmailAction) => {
                        this.actions.push(action);
                    }
                });
            }
        });

        alert.addButton({
            text: 'SMS',
            handler: (data) => {

                if (this.phones.length === 0) {

                    this.alertCtrl.create({
                        title: 'Verify Phone number',
                        subTitle: 'At least one verified Phone number is required',
                        buttons: ['Ok']
                    }).present();

                    return;
                }

                this.navCtrl.push(SmsActionPage, {
                    phones: this.phones,
                    callback: (action: SmsAction) => {
                        this.actions.push(action);
                    }
                });
            }
        });

        alert.addButton({
            text: 'PUSH',
            handler: (data) => {
                this.navCtrl.push(PushActionPage, {
                    callback: (action: PushAction) => {
                        this.actions.push(action);
                    }
                });
            }
        });

        alert.addButton({
            text: 'WEB PUSH',
            handler: (data) => {
                this.navCtrl.push(WebPushActionPage, {
                    callback: (action: WebPushAction) => {
                        this.actions.push(action);
                    }
                });
            }
        });

        alert.addButton('Cancel');

        alert.present();
    }

    public goEditConditionPage(condition) {

        if (this.rule.devicesType === 'GPS') {

            switch (condition.conditionType) {
                case 'geoZone':
                    this.navCtrl.push(GeoZoneConditionPage, {
                        condition,
                        mobileDeviceLocation: this.mobileDeviceLocation,
                        callback: (cond: GeoZoneCondition) => {
                            this.doUpdateCondition(cond);
                        }
                    });
                    break;
                case 'temperature':
                    this.navCtrl.push(TemperatureConditionPage, {
                        condition,
                        callback: (cond: TemperatureCondition) => {
                            this.doUpdateCondition(cond);
                        }
                    });
                    break;
                case 'ntc1':
                    this.navCtrl.push(NTC1ConditionPage, {
                        condition,
                        callback: (cond: NTC1Condition) => {
                            this.doUpdateCondition(cond);
                        }
                    });
                    break;
                case 'volts':
                    this.navCtrl.push(VoltsConditionPage, {
                        condition,
                        callback: (cond: VoltsCondition) => {
                            this.doUpdateCondition(cond);
                        }
                    });
                    break;
                case 'speed':
                    this.navCtrl.push(SpeedConditionPage, {
                        condition,
                        callback: (cond: SpeedCondition) => {
                            this.doUpdateCondition(cond);
                        }
                    });
                    break;
                case 'motion':
                    this.navCtrl.push(MotionConditionPage, {
                        condition,
                        callback: (cond: MotionCondition) => {
                            this.doUpdateCondition(cond);
                        }
                    });
                    break;
                case 'battery':
                    this.navCtrl.push(BatteryConditionPage, {
                        condition,
                        callback: (cond: BatteryCondition) => {
                            this.doUpdateCondition(cond);
                        }
                    });
                    break;
                case 'changeState':
                    this.navCtrl.push(StateChangeConditionPage, {
                        condition,
                        callback: (cond: StateChangeCondition) => {
                            this.doUpdateCondition(cond);
                        }
                    });
                    break;
                case 'reeferHours':
                    this.navCtrl.push(ReeferHoursConditionPage, {
                        condition,
                        callback: (cond: ReeferHoursCondition) => {
                            this.doUpdateCondition(cond);
                        }
                    });
                    break;
                default:
                    console.log(`Unexpected condition type '${condition.conditionType}"`);
            }
        } else {
            switch (condition.conditionType) {
                case 'temperature':
                    this.navCtrl.push(TemperatureConditionPage, {
                        condition,
                        callback: (cond: TemperatureCondition) => {
                            this.doUpdateCondition(cond);
                        }
                    });
                    break;
                case 'battery':
                    this.navCtrl.push(BatteryConditionPage, {
                        condition,
                        callback: (cond: BatteryCondition) => {
                            this.doUpdateCondition(cond);
                        }
                    });
                    break;
                case 'humidity':
                    this.navCtrl.push(HumidityConditionPage, {
                        condition,
                        callback: (cond: HumidityCondition) => {
                            this.doUpdateCondition(cond);
                        }
                    });
                    break;
                default:
                    console.log(`Unexpected condition type '${condition.conditionType}"`);
            }
        }
    }

    public goEditActionPage(action) {

        switch (action.actionType) {
            case 'push':
                this.navCtrl.push(PushActionPage, {
                    action,
                    callback: (act: PushAction) => {
                        this.doUpdateAction(act);
                    }
                });
                break;
            case 'web-push':
                this.navCtrl.push(WebPushActionPage, {
                    action,
                    callback: (act: WebPushAction) => {
                        this.doUpdateAction(act);
                    }
                });
                break;
            case 'sms':
                this.navCtrl.push(SmsActionPage, {
                    action,
                    phones: this.phones,
                    callback: (act: SmsAction) => {
                        this.doUpdateAction(act);
                    }
                });
                break;
            case 'email':
                this.navCtrl.push(EmailActionPage, {
                    action,
                    emails: this.emails,
                    callback: (act: EmailAction) => {
                        this.doUpdateAction(act);
                    }
                });
                break;
            default:
                console.log(`Unexpected action type "${action.actionType}"`);
        }
    }

    public enableCondition(condition, slidingItem: ItemSliding) {

        this.conditions = this.conditions.map((cond) => {
            if (cond.uid === condition.uid) {
                cond.enabled = true;
            }

            return cond;
        });

        slidingItem.close();
    }

    public disableCondition(condition, slidingItem: ItemSliding) {

        this.conditions = this.conditions.map((cond) => {
            if (cond.uid === condition.uid) {
                cond.enabled = false;
            }

            return cond;
        });

        slidingItem.close();
    }

    public enableAction(action, slidingItem: ItemSliding) {

        this.actions = this.actions.map((act) => {
            if (act.uid === action.uid) {
                act.enabled = true;
            }

            return act;
        });

        slidingItem.close();
    }

    public disableAction(action, slidingItem: ItemSliding) {

        this.actions = this.actions.map((act) => {
            if (act.uid === action.uid) {
                act.enabled = false;
            }

            return act;
        });

        slidingItem.close();
    }

    public removeCondition(condition) {

        this.conditions = this.conditions.filter((cond) => cond.uid !== condition.uid);
    }

    public removeAction(action) {

        this.actions = this.actions.filter((act) => act.uid !== action.uid);
    }

    public isDeviceSelected(device: IDevice) {

        return this.rule && this.rule.devices.indexOf(device.id) > -1;
    }

    public toggleDeviceSelection(ev, device) {

        if (this.isDeviceSelected(device)) {

            this.rule.devices = this.rule.devices.filter((dev) => {

                return dev !== device.id;
            });

        } else {

            this.rule.devices.push(device.id);
        }
    }

    public searchDevices(event) {

        const value = event.target.value;

        if (value && value.trim() !== '') {

            this.searchDevicesString = value.toLowerCase();

            this.devices = this.allDevices.filter((device: IDevice) => {

                return device.name.toLowerCase().indexOf(this.searchDevicesString) > -1;
            });

        } else {

            this.searchDevicesString = null;

            this.devices = this.allDevices;
        }
    }

    public collectDurationToString(collectDuration) {

        return humanizeDuration(collectDuration * 1000);
    }

    public save() {

        if (this.conditions.length === 0) {

            return alert('Please, add at least 1 condition');
        }

        if (this.actions.length === 0) {

            return alert('Please, add at least 1 action');
        }

        if (this.match === 'any') {

            this.rule.conditions = {
                any: this.conditions
            };

        } else if (this.match === 'all') {

            this.rule.conditions = {
                all: this.conditions
            };

        } else {

            console.log(`Unexpected conditions group`);
        }

        this.rule.actions = this.actions;

        if (this.ruleId) {

            this.updateRule();

        } else {

            this.addRule();
        }
    }

    private loadRule() {

        const loader = this.loadingCtrl.create({ content: `Loading rule` });

        // noinspection JSIgnoredPromiseFromCall
        loader.present();

        this.ruleProvider.getItem(this.ruleId).then((rule: IRule) => {

            // noinspection JSIgnoredPromiseFromCall
            loader.dismiss();

            this.rule = rule;

            if (this.rule.conditions) {

                if (this.rule.conditions.any) {

                    this.match = 'any';
                    this.conditions = this.rule.conditions.any;

                } else if (this.rule.conditions.all) {

                    this.match = 'all';
                    this.conditions = this.rule.conditions.all;

                } else {

                    console.log(`Unexpected conditions group`);
                }

                this.conditions = this.conditions.map((conditionData) => {

                    return ConditionFactory.createCondition(conditionData);
                });
            }

            this.actions = this.rule.actions.map((actionData) => {

                return ActionFactory.createAction(actionData);
            });

        }).catch((err) => {
            // noinspection JSIgnoredPromiseFromCall
            loader.dismiss();
            console.log(err);
        });
    }

    private doUpdateCondition(condition) {

        this.conditions = this.conditions.map((cond) => {
            if (cond.uid === condition.uid) {
                return condition;
            }
            return cond;
        });
    }

    private doUpdateAction(action) {

        this.actions = this.actions.map((act) => {
            if (act.uid === action.uid) {
                return action;
            }
            return act;
        });
    }

    private addRule() {

        this.ruleProvider.addItem(this.rule).then((rule: IRule) => {

            this.navCtrl.pop();

        }).catch((err) => {
            console.log(err);
        });
    }

    private updateRule() {

        this.ruleProvider.updateItem(this.rule).then((rule: IRule) => {

            this.navCtrl.pop();

        }).catch((err) => {
            console.log(err);
        });
    }
}
