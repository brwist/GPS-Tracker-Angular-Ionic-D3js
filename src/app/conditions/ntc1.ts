import { IAbstractCondition } from './condition-factory';
import { BaseCondition } from './base';

export interface INTC1ConditionOptions {
    operator: string;
    value: number;
    uid: string;
}

export class NTC1Condition extends BaseCondition implements IAbstractCondition {

    public conditionType: string = 'ntc1';
    public operator: string;
    public value: number;

    constructor(options?: INTC1ConditionOptions) {
        super(options);

        if (options) {

            this.operator = options.operator;
            this.value    = options.value;

        } else { // apply defaults

            this.operator = 'greaterThan';
            this.value    = 77;
        }
    }

    public getExplanation(): string {

        if (this.operator === 'greaterThan') {

            return `Temperature (NTC1) greater than ${this.value} °F`;

        } else if (this.operator === 'lessThan') {

            return `Temperature (NTC1) less than ${this.value} °F`;
        }

        return 'n/a';
    }
}
