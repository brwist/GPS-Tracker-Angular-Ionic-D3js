import { IAbstractCondition } from './condition-factory';
import { BaseCondition } from './base';

export interface IStateChangeConditionOptions {
    operator: string;
    value: any;
    uid: string;
}

export class StateChangeCondition extends BaseCondition implements IAbstractCondition {

    public conditionType: string = 'changeState';
    public operator: string;
    public value: any;

    constructor(options?: IStateChangeConditionOptions) {
        super(options);

        if (options) {

            this.operator = options.operator;
            this.value    = options.value;

        } else { // apply defaults

            this.operator = 'changeState';
            this.value    = {
                fromState: '',
                toState: ''
            };
        }
    }

    public getExplanation(): string {

        if (this.value.fromState && this.value.toState) {

            return `US State change: ${this.value.fromState} -> ${this.value.toState}`;
        }

        if (this.value.fromState) {

            return `Leave ${this.value.fromState} US State`;
        }

        if (this.value.toState) {

            return `Enter ${this.value.toState} US State`;
        }

        return `US State change`;
    }
}
