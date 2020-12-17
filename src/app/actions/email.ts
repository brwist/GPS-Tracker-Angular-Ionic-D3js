import { BaseAction } from './base';

export interface IEmailActionData {
    email: string;
    title: string;
    deviceString?: string;
}

export interface IEmailActionOptions {
    data: IEmailActionData;
    uid: string;
}

export class EmailAction extends BaseAction {

    public actionType: string = 'email';
    public data: IEmailActionData;

    constructor(options?: IEmailActionOptions) {
        super(options);

        if (options) {

            this.data = options.data;

        } else { // apply defaults

            this.data = {
                email: '',
                title: 'Title',
                deviceString: 'Device'
            };
        }
    }

    public getExplanation() {

        return `Email to "${this.data.email}"`;
    }
}
