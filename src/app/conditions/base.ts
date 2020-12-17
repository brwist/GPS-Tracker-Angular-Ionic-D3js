import { UUID } from 'angular2-uuid';
import { IAbstractCondition } from './condition-factory';

export abstract class BaseCondition implements IAbstractCondition {

    public conditionType: string;
    public operator: string;
    public uid: string;
    public enabled: boolean;

    constructor(options) {

        if (options) {

            this.uid     = options.uid;
            this.enabled = options.enabled;

        } else { // apply defaults

            this.uid     = UUID.UUID();
            this.enabled = true;
        }
    }

    public abstract getExplanation(): string;
}
