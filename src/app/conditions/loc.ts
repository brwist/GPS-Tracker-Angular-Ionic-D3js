import { IAbstractCondition } from './condition-factory';
import { BaseCondition } from './base';

export interface ILoCConditionOptions {
    value: number;
    uid: string;
}

export class LoCCondition extends BaseCondition implements IAbstractCondition {

    public conditionType: string = 'lossOfCommunication';
    public operator: string = 'locGreaterThan';
    public value: number = 20;

    constructor(options?: ILoCConditionOptions) {
        super(options);

        if (options && options.value) {
            this.value = options.value;
        }
    }

    public getExplanation(): string {
        return `Loss of Communication greater than ${this.value} min`;
    }
}
