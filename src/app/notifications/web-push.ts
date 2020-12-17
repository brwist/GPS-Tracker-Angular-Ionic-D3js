import { IAbstractNotification } from './notification-factory';
import { BaseNotification } from './base';

export interface IWebPushNotificationData {
    title: string;
}

export interface IWebPushNotificationOptions {
    data: IWebPushNotificationData;
    uid: string;
}

export class WebPushNotification extends BaseNotification implements IAbstractNotification {

    public notificationType: string = 'web-push';
    public data: IWebPushNotificationData;

    constructor(options?: IWebPushNotificationOptions) {
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

        return `WEB PUSH notification`;
    }
}
