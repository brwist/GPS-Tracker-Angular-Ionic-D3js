import { IAbstractCondition } from './condition-factory';
import { BaseCondition } from './base';

export interface IMotionConditionOptions {
    operator: string;
    value: number;
    uid: string;
}

export class MotionCondition extends BaseCondition implements IAbstractCondition {

    public conditionType: string = 'motion';
    public operator: string;
    public value: number;

    constructor(options?: IMotionConditionOptions) {
        super(options);

        if (options) {

            this.operator = options.operator;
            this.value    = options.value;

        } else { // apply defaults

            this.operator = 'greaterThan';
            this.value    = 1;
        }
    }

    public getExplanation() {

        switch (this.value) {
            case 0:
                return 'Any motion';
            case 1:
                return 'Motion Level 2';
            case 2:
                return 'Motion Level 3';
            case 3:
                return 'Motion Level 4';
            case 4:
                return 'Motion Level 5';
            default:
                throw new Error(`MotionCondition::getExplanation(): Unexpected motionOption: ${this.value}`);
        }
    }
}
