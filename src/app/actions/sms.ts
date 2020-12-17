import { BaseAction } from './base';

export interface ISmsActionData {
    phone: string;
    title: string;
}

export interface ISmsActionOptions {
    data: ISmsActionData;
    uid: string;
}

export class SmsAction extends BaseAction {

    public actionType: string = 'sms';
    public data: ISmsActionData;

    constructor(options?: ISmsActionOptions) {
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
