import { Component, OnInit } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';

@Component({
    selector: 'popover-page',
    templateUrl: 'popover.html'
})
export class AlertOrNotificationPopoverPage implements OnInit {

    private markAllAsSeenCallback: () => void;
    private clearAllCallback: () => void;

    constructor(private viewCtrl: ViewController,
                private navParams: NavParams) {

    }

    public ngOnInit() {

        this.markAllAsSeenCallback = this.navParams.get('markAllAsSeenCallback');
        this.clearAllCallback      = this.navParams.get('clearAllCallback');
    }

    public markAllAsSeen() {

        this.markAllAsSeenCallback();

        this.viewCtrl.dismiss();
    }

    public clearAll() {

        this.clearAllCallback();

        this.viewCtrl.dismiss();
    }
}
