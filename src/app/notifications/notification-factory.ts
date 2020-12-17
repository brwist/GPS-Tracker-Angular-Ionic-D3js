import { EmailNotification } from './email';
import { SmsNotification } from './sms';
import { PushNotification } from './push';
import { WebPushNotification } from './web-push';

export interface IAbstractNotification {
    notificationType: string;
    uid: string;
    enabled: boolean;
    data: INotificationData;

    getExplanation(): string;
}

export interface INotificationData {
    title: string;
    body?: string;
    email?: string;
    phone?: string;
}

export class NotificationFactory {

    public static createNotification(actionData: any): IAbstractNotification {

        switch (actionData.notificationType) {
            case 'email':
                return new EmailNotification(actionData);
            case 'sms':
                return new SmsNotification(actionData);
            case 'push':
                return new PushNotification(actionData);
            case 'web-push':
                return new WebPushNotification(actionData);
            default:
                throw new Error(`NotificationFactory::createNotification: Unexpected ` +
                    `notification type "${actionData.notificationType}"`);
        }
    }
}
