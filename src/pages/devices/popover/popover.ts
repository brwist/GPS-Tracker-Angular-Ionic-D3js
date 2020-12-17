import { Component, OnInit } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';
import { ISorting } from '../../../providers/base';

@Component({
    selector: 'devices-popover-page',
    templateUrl: 'popover.html'
})
export class DevicesPopoverPage implements OnInit {

    private sorting: ISorting;

    private newDeviceCallback: () => void;
    private sortCallback: (sortingField: string, sortingOrder: string) => void;

    constructor(private viewCtrl: ViewController,
                private navParams: NavParams) {

    }

    public ngOnInit() {

        this.sorting = this.navParams.get('sorting');

        this.newDeviceCallback = this.navParams.get('newDeviceCallback');
        this.sortCallback      = this.navParams.get('sortCallback');
    }

    public newDevice() {

        this.newDeviceCallback();

        this.viewCtrl.dismiss();
    }

    public sort(sortingField: string, sortingOrder: string) {

        this.sortCallback(sortingField, sortingOrder);

        this.viewCtrl.dismiss();
    }

    public isActive(sortingField: string, sortingOrder: string): boolean {

        if (!this.sorting) return false;

        return (this.sorting.sortingField === sortingField && this.sorting.sortingOrder === sortingOrder);
    }
}
