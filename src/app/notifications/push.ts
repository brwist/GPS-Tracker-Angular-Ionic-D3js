import { IAbstractNotification } from './notification-factory';
import { BaseNotification } from './base';

export interface IPushNotificationData {
    title: string;
}

export interface IPushNotificationOptions {
    data: IPushNotificationData;
    uid: string;
}

export class PushNotification extends BaseNotification implements IAbstractNotification {

    public notificationType: string = 'push';
    public data: IPushNotificationData;

    constructor(options?: IPushNotificationOptions) {
        super(options);

        if (options) {

            this.data = options.data;

        } else { // apply defaults

            this.data = {
                title: 'Message..'
            };
        }
    }

    public getExplanation() {

        return `PUSH notification`;
    }
}
