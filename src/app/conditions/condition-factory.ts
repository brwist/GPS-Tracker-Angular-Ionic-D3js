import { TemperatureCondition } from './temperature';
import { NTC1Condition } from './ntc1';
import { VoltsCondition } from './volts';
import { MotionCondition } from './motion';
import { GeoZoneCondition } from './geo-zone';
import { StateChangeCondition } from './change-state';
import { BatteryCondition } from './battery';
import { SpeedCondition } from './speed';
import { ReeferHoursCondition } from './reefer-hours';
import { HumidityCondition } from './humidity';
import { LoCCondition } from './loc';

export interface IAbstractCondition {
    conditionType: string;
    operator: string;
    uid: string;
    enabled: boolean;

    getExplanation(): string;
}

export class ConditionFactory {

    public static createCondition(conditionData: any): IAbstractCondition {

        switch (conditionData.conditionType) {
            case 'temperature':
                return new TemperatureCondition(conditionData);
            case 'humidity':
                return new HumidityCondition(conditionData);
            case 'ntc1':
                return new NTC1Condition(conditionData);
            case 'volts':
                return new VoltsCondition(conditionData);
            case 'speed':
                return new SpeedCondition(conditionData);
            case 'motion':
                return new MotionCondition(conditionData);
            case 'geoZone':
                return new GeoZoneCondition(conditionData);
            case 'changeState':
                return new StateChangeCondition(conditionData);
            case 'battery':
                return new BatteryCondition(conditionData);
            case 'reeferHours':
                return new ReeferHoursCondition(conditionData);
            case 'lossOfCommunication':
                return new LoCCondition(conditionData);
            default:
                throw new Error(`ConditionFactory::createCondition: Unexpected condition type ${conditionData.type}`);
        }
    }
}
