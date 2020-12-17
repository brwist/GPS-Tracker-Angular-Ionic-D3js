import { IAbstractCondition } from './condition-factory';
import { BaseCondition } from './base';

export interface ITemperatureConditionOptions {
    operator: string;
    value: number;
    uid: string;
}

export class TemperatureCondition extends BaseCondition implements IAbstractCondition {

    public conditionType: string = 'temperature';
    public operator: string;
    public value: number;

    constructor(options?: ITemperatureConditionOptions) {
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

            return `Temperature greater than ${this.value} °F`;

        } else if (this.operator === 'lessThan') {

            return `Temperature less than ${this.value} °F`;
        }

        return 'n/a';
    }
}
