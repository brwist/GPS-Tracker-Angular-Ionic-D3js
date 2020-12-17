import { EmailAction } from './email';
import { SmsAction } from './sms';
import { PushAction } from './push';
import { WebPushAction } from './web-push';

export interface IAbstractAction {
    actionType: string;
    uid: string;
    enabled: boolean;

    getExplanation(): string;
}

export class ActionFactory {

    public static createAction(actionData: any): IAbstractAction {

        switch (actionData.actionType) {
            case 'email':
                return new EmailAction(actionData);
            case 'sms':
                return new SmsAction(actionData);
            case 'push':
                return new PushAction(actionData);
            case 'web-push':
                return new WebPushAction(actionData);
            default:
                throw new Error(`ActionFactory::createAction: Unexpected action type "${actionData.type}"`);
        }
    }
}
