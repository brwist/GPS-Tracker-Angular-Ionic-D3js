import { BaseAction } from './base';

export interface IWebPushActionData {
    title: string;
}

export interface IWebPushActionOptions {
    data: IWebPushActionData;
    uid: string;
}

export class WebPushAction extends BaseAction {

    public actionType: string = 'web-push';
    public data: IWebPushActionData;

    constructor(options?: IWebPushActionOptions) {
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
