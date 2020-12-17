import { IAbstractCondition } from './condition-factory';
import { BaseCondition } from './base';

export interface IGeoZoneConditionValueCenter {
    latitude: number;
    longitude: number;
}

export interface IGeoZoneConditionValue {
    center: IGeoZoneConditionValueCenter;
    radius: number;
}

export interface IGeoZoneConditionOptions {
    operator: string;
    value: IGeoZoneConditionValue;
    uid: string;
}

export class GeoZoneCondition extends BaseCondition implements IAbstractCondition {

    public conditionType: string = 'geoZone';
    public operator: string;
    public value: IGeoZoneConditionValue;

    constructor(options?: IGeoZoneConditionOptions, mobileDeviceLocation?: any) {
        super(options);

        if (options) {

            this.operator = options.operator;
            this.value    = options.value;

        } else { // apply defaults

            this.operator = 'inZone';
            this.value    = {
                center: {
                    latitude: 42.335720, // default value (mobile device location is unknown)
                    longitude: -71.087530 // default value (mobile device location is unknown)
                },
                radius: 200
            };

            if (mobileDeviceLocation) {

                this.value.center.latitude  = mobileDeviceLocation.latitude;
                this.value.center.longitude = mobileDeviceLocation.longitude;
            }
        }
    }

    public getExplanation(): string {

        if (this.operator === 'inZone') {

            return `Device in geo zone with radius ${this.value.radius}`;

        } else if (this.operator === 'notInZone') {

            return `Device not in geo zone with radius ${this.value.radius}`;

        } else if (this.operator === 'either') {

            return `Device enters or leaves geo zone with radius ${this.value.radius}`;
        }

        return 'n/a';
    }
}
