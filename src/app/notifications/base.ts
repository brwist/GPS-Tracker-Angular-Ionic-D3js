import { UUID } from 'angular2-uuid';
import { IAbstractNotification } from './notification-factory';

export abstract class BaseNotification implements IAbstractNotification {

    public notificationType: string;
    public enabled: boolean;
    public uid: string;
    public data;

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
