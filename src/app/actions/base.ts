import { UUID } from 'angular2-uuid';
import { IAbstractAction } from './action-factory';

export abstract class BaseAction implements IAbstractAction {

    public actionType: string;
    public uid: string;
    public enabled: boolean;
    public collectDuration: number;

    constructor(options) {

        if (options) {

            this.uid             = options.uid;
            this.enabled         = options.enabled;
            this.collectDuration = options.collectDuration;

        } else { // apply defaults

            this.uid             = UUID.UUID();
            this.enabled         = true;
            this.collectDuration = 0;
        }
    }

    public abstract getExplanation(): string;
}
