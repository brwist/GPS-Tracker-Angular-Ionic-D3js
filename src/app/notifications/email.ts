import { IAbstractNotification } from './notification-factory';
import { BaseNotification } from './base';

export interface IEmailNotificationData {
    email?: string;
    title: string;
}

export interface IEmailNotificationOptions {
    data: IEmailNotificationData;
    uid: string;
}

export class EmailNotification extends BaseNotification implements IAbstractNotification {

    public notificationType: string = 'email';
    public data: IEmailNotificationData;

    constructor(options?: IEmailNotificationOptions) {
        super(options);

        if (options) {

            this.data = options.data;

        } else { // apply defaults

            this.data = {
                email: '',
                title: 'Title'
            };
        }
    }

    public getExplanation() {

        return `Email to "${this.data.email}"`;
    }
}
