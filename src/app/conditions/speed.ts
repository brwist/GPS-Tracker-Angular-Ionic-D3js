import { BaseCondition } from './base';
import { IAbstractCondition } from './condition-factory';

export interface ISpeedConditionOptions {
    operator: string;
    value: number;
    uid: string;
}

export class SpeedCondition extends BaseCondition implements IAbstractCondition {

    public conditionType: string = 'speed';
    public operator: string;
    public value: number;

    constructor(options?: ISpeedConditionOptions) {
        super(options);

        if (options) {

            this.operator = options.operator;
            this.value    = options.value;

        } else { // apply defaults

            this.operator = 'greaterThan';
            this.value    = 90;
        }
    }

    public getExplanation(): string {

        if (this.operator === 'greaterThan') {

            return `Speed greater than ${this.value} mph`;

        } else if (this.operator === 'lessThan') {

            return `Speed less than ${this.value} mph`;
        }

        return 'n/a';
    }
}
