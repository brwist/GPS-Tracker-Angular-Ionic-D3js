import { BaseCondition } from './base';
import { IAbstractCondition } from './condition-factory';

export interface IHumidityConditionOptions {
    operator: string;
    value: number;
    uid: string;
}

export class HumidityCondition extends BaseCondition implements IAbstractCondition {

    public conditionType: string = 'humidity';
    public operator: string;
    public value: number;

    constructor(options?: IHumidityConditionOptions) {
        super(options);

        if (options) {

            this.operator = options.operator;
            this.value    = options.value;

        } else { // apply defaults

            this.operator = 'greaterThan';
            this.value    = 60;
        }
    }

    public getExplanation(): string {

        if (this.operator === 'greaterThan') {

            return `Humidity greater than ${this.value}%`;

        } else if (this.operator === 'lessThan') {

            return `Humidity less than ${this.value}%`;
        }

        return 'n/a';
    }
}
