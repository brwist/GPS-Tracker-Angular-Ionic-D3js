import { Component } from '@angular/core';
import { NotificationPage } from '../notification/notification';
import { NavParams, ViewController } from 'ionic-angular';
import { NativeRingtones } from '@ionic-native/native-ringtones';
import { Logger } from '../../../providers/logger';

@Component({
    selector: 'page-rington-picker',
    templateUrl: 'rington-picker.html'
})
export class RingtonPickerPage {

    public ringtones: any[] = [];

    public ringtone: any;

    private callback: (ringtone) => void;

    constructor(private ringtonesModule: NativeRingtones,
                private params: NavParams,
                private logger: Logger,
                private viewCtrl: ViewController) {

    }

    public ngOnInit() {

        this.callback = this.params.get('callback');
        this.ringtone = this.params.get('ringtone');

        this.ringtonesModule.getRingtone().then((ringtones) => {

            this.ringtones = ringtones;
        });
    }

    public selectRingtone(value) {

        this.ringtone = value;

        if (this.ringtone) {

            this.ringtonesModule.playRingtone(this.ringtone.Url).catch((err) => {
                this.logger.error(err);
            });
        }
    }

    public save() {

        this.callback(this.ringtone);

        this.viewCtrl.dismiss();
    }

    public dismiss() {

        this.viewCtrl.dismiss();
    }
}
