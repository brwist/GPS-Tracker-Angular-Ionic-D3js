import { BaseAction } from './base';

export interface IPushActionData {
    title: string;
}

export interface IPushActionOptions {
    data: IPushActionData;
    uid: string;
}

export class PushAction extends BaseAction {

    public actionType: string = 'push';
    public data: IPushActionData;

    constructor(options?: IPushActionOptions) {
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
