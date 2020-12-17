import { IAbstractCondition } from './condition-factory';
import { BaseCondition } from './base';

export interface IVoltsConditionOptions {
    operator: string;
    value: number;
    uid: string;
}

export class VoltsCondition extends BaseCondition implements IAbstractCondition {

    public conditionType: string = 'volts';
    public operator: string;
    public value: number;

    constructor(options?: IVoltsConditionOptions) {
        super(options);

        if (options) {

            this.operator = options.operator;
            this.value    = options.value;

        } else { // apply defaults

            this.operator = 'lessThan';
            this.value    = 11.8;
        }
    }

    public getExplanation(): string {

        if (this.operator === 'greaterThan') {

            return `Volt greater than ${this.value}`;

        } else if (this.operator === 'lessThan') {

            return `Volt less than ${this.value}`;
        }

        return 'n/a';
    }
}
