import { IAbstractCondition } from './condition-factory';
import { BaseCondition } from './base';

export interface IReeferHoursConditionOptions {
    operator: string;
    value: number;
    uid: string;
}

export class ReeferHoursCondition extends BaseCondition implements IAbstractCondition {

    public conditionType: string = 'reeferHours';
    public operator: string;
    public value: number;

    constructor(options?: IReeferHoursConditionOptions) {
        super(options);

        if (options) {

            this.operator = options.operator;
            this.value    = options.value;

        } else { // apply defaults

            this.operator = 'reeferHoursGreaterThen';
            this.value    = 100;
        }
    }

    public getExplanation(): string {

        if (this.operator === 'reeferHoursGreaterThen') {

            return `Reefer Hours is greater than ${this.value} h`;

        } else {

            return 'n/a';
        }
    }
}
