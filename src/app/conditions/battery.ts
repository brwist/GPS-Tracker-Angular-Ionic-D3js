import { IAbstractCondition } from './condition-factory';
import { BaseCondition } from './base';

export interface IBatteryConditionOptions {
    operator: string;
    value: number;
    uid: string;
}

export class BatteryCondition extends BaseCondition implements IAbstractCondition {

    public conditionType: string = 'battery';
    public operator: string;
    public value: number;

    constructor(options?: IBatteryConditionOptions) {
        super(options);

        if (options) {

            this.operator = options.operator;
            this.value    = options.value;

        } else { // apply defaults

            this.operator = 'batteryLessThan';
            this.value    = 30;
        }
    }

    public getExplanation(): string {

        if (this.operator === 'batteryGreaterThan') {

            return `Battery level is greater than ${this.value} %`;

        } else if (this.operator === 'batteryLessThan') {

            return `Battery level is less than ${this.value} %`;
        }

        return 'n/a';
    }
}
