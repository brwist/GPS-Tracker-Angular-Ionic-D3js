import { Component } from '@angular/core';
import { NavParams } from 'ionic-angular';
import { IFirmwareUpdateInfo } from '../../../providers/api';

@Component({
    selector: 'page-latest-version',
    templateUrl: 'latest-version.html'
})
export class LatestVersionPage {

    public firmwareUpdateInfo: IFirmwareUpdateInfo;

    constructor(private params: NavParams) {

        this.firmwareUpdateInfo = this.params.get('firmwareUpdateInfo');
    }
}
