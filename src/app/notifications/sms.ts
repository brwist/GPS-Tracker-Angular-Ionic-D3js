import { IAbstractNotification } from './notification-factory';
import { BaseNotification } from './base';

export interface ISmsNotificationData {
    phone?: string;
    title: string;
}

export interface ISmsNotificationOptions {
    data: ISmsNotificationData;
    uid: string;
}

export class SmsNotification extends BaseNotification implements IAbstractNotification {

    public notificationType: string = 'sms';
    public data: ISmsNotificationData;

    constructor(options?: ISmsNotificationOptions) {
        super(options);

        if (options) {

            this.data = options.data;

        } else { // apply defaults

            this.data = {
                phone: '',
                title: 'Message..'
            };
        }
    }

    public getExplanation() {

        return `SMS to "${this.data.phone}"`;
    }
}
