import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { ModalController, NavParams } from 'ionic-angular';
import * as moment from 'moment';
import * as momentTimezone from 'moment-timezone';
import { ApiProvider } from '../../../providers/api';
import { IDevice, ITrack } from '../../../providers/device';
import { Logger } from '../../../providers/logger';
import { TrackProvider } from '../../../providers/track';
import { ChartBase } from './chart.base';

@Component({
    selector: 'page-gps-charts',
    templateUrl: 'charts.html'
})
export class DeviceGPSChartsPage extends ChartBase implements OnInit {
    public _chartData: any = {};

    get chartData() {
        return this._chartData[this.chartType];
    }

    get isCableKitConnected() {
        return this.device && this.device.lastTrack && this.device.lastTrack.battery === 'K';
    }

    public chartTypes = [
        {
            value: 'batteryOrVolts',
            label: this.isCableKitConnected ? 'Volts' : 'Battery'
        },
        {
            value: 'temperature',
            label: 'Temperature'
        }
    ];

    public groupedBy: string;
    public pointsTotal: number;

    public device: IDevice;

    public chartDataColors = {
        batteryOrVolts: [{
            backgroundColor: 'rgba(148, 159, 177, 0.2)',
            borderColor: 'rgba(148, 159, 177,1)',
            pointBackgroundColor: 'rgba(148, 159, 177, 1)',
            pointBorderColor: 'rgba(148, 159, 177, 1)',
            pointHoverBackgroundColor: 'rgba(148, 159, 177, 0.5)',
            pointHoverBorderColor: 'rgba(148, 159, 177, 0.8)'
        }],
        temperature: [{
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            pointBackgroundColor: 'rgba(54, 162, 235, 1)',
            pointBorderColor: 'rgba(54, 162, 235, 1)',
            pointHoverBackgroundColor: 'rgba(54, 162, 235, 0.5)',
            pointHoverBorderColor: 'rgba(54, 162, 235, 1)'
        }]
    };

    private chartType: string = 'batteryOrVolts';

    private dataItems;

    constructor(
        protected logger: Logger,
        private params: NavParams,
        protected storage: Storage,
        protected modalCtrl: ModalController,
        private trackProvider: TrackProvider,
        protected apiProvider: ApiProvider
    ) {
        super(logger, storage, modalCtrl, apiProvider);

        this.device = this.params.get('device');
    }

    protected loadChartData() {
        const select = ['timestamp', 'temperature', 'ntc1'];

        if (this.isCableKitConnected) {
            select.push('volts');
        } else {
            select.push('battery');
        }

        this.trackProvider.getListForChart(this.device.id, {
            filter: {
                startDate:
                    encodeURIComponent(momentTimezone(this.startDate).tz(this.timeZone).startOf('day').format()),
                endDate:
                    encodeURIComponent(momentTimezone(this.endDate).tz(this.timeZone).endOf('day').format())
            },
            select,
            lean: true
        }).then((data: any) => {

            this.dataItems = data.items;

            if (this.isCableKitConnected) {

                let ntcIsValid = false;

                for (const item of this.dataItems) {

                    if (/\d+\.?\d?/.test(item.ntc1)) {

                        ntcIsValid = true;

                        break;
                    }
                }

                if (ntcIsValid) {

                    this.dataItems = this.dataItems.map((item) => {

                        item.temperature = item.ntc1;

                        return item;
                    });
                }
            }

            this.renderCharts();

        }).catch((err) => {
            this.logger.error(err);
        });
    }

    protected renderCharts() {

        let points;

        this.groupedBy = null;

        if (this.dataItems.length > this.maxNumberOfPointsNumber) {

            if (moment(this.endDate).diff(this.startDate, 'days') === 0) {

                points = this.groupBy('hour');

            } else {

                points = this.groupBy('day');
            }

        } else {

            points = this.dataItems.map((item: ITrack) => {
                return {
                    label: this.formatTimeLabel(item.timestamp, `HH:mm`),
                    fullDate: this.formatTimeLabel(item.timestamp, `M/DD/YYYY, h:mm:ss a`),
                    batteryOrVolts: this.prepareBatteryOrVoltsData(this.isCableKitConnected ? item.volts : item.battery),
                    temperature: item.temperature
                };
            });

            // console.log(points);
        }

        this._chartData = {};

        setTimeout(() => {

            this._chartData.batteryOrVolts = {
                dataSets: [{
                    data: points.map((item: any) => item.batteryOrVolts),
                    label: this.isCableKitConnected ? `Volts` : `Battery`,
                    borderWidth: 1,
                    pointBorderWidth: 1,
                    pointRadius: 1,
                    pointHoverRadius: 2,
                    pointHitRadius: 25
                }],
                labels: points.map((item: any) => item.label),
                options: {
                    responsive: true,
                    scales: {
                        yAxes: [{
                            ticks: { min: 0, max: this.isCableKitConnected ? 35 : 100 }
                        }]
                    },
                    layout: {
                        padding: {
                            top: 20,
                            left: 10,
                            right: 10
                        }
                    },
                    animation: {
                        duration: 0
                    },
                    tooltips: {
                        callbacks: {
                            title: (tooltipItem) => {

                                // console.log(points[tooltipItem[0].index]);

                                if (points[tooltipItem[0].index].fullDate) {
                                    return points[tooltipItem[0].index].fullDate;
                                } else {
                                    return points[tooltipItem[0].index].label;
                                }
                            }
                        }
                    }
                },
                colors: this.chartDataColors.batteryOrVolts,
                legend: false,
                chartType: 'line'
            };

            this._chartData.temperature = {
                dataSets: [{
                    data: points.map((item: any) => item.temperature),
                    label: `Temperature`,
                    borderWidth: 1,
                    pointBorderWidth: 1,
                    pointRadius: 1,
                    pointHoverRadius: 2,
                    pointHitRadius: 25
                }],
                labels: points.map((item: any) => item.label),
                options: {
                    responsive: true,
                    layout: {
                        padding: {
                            top: 20,
                            left: 10,
                            right: 10
                        }
                    },
                    animation: {
                        duration: 0
                    },
                    tooltips: {
                        callbacks: {
                            title: (tooltipItem) => {

                                // console.log(points[tooltipItem[0].index]);

                                if (points[tooltipItem[0].index].fullDate) {
                                    return points[tooltipItem[0].index].fullDate;
                                } else {
                                    return points[tooltipItem[0].index].label;
                                }
                            }
                        }
                    }
                },
                colors: this.chartDataColors.temperature,
                legend: false,
                chartType: 'line'
            };

        }, 100);
    }

    protected groupBy(kind: string) {

        const by = [];
        const raw = {};

        this.groupedBy = kind;
        this.pointsTotal = this.dataItems.length;

        this.dataItems.forEach((item: ITrack) => {

            let token;

            if (kind === 'day') {

                token = momentTimezone.tz(item.timestamp, this.timeZone).format('MMM, DD');

            } else {

                token = momentTimezone.tz(item.timestamp, this.timeZone).format('h a');
            }

            if (!raw[token]) raw[token] = [];

            raw[token].push({
                batteryOrVolts: this.isCableKitConnected ? item.volts : item.battery,
                temperature: item.temperature
            });
        });

        for (const token in raw) {

            if (raw.hasOwnProperty(token)) {

                let batteryOrVoltsTotal = 0;
                let batteryOrVoltsSum = 0;

                let temperatureTotal = 0;
                let temperatureSum = 0;

                raw[token].forEach((item) => {

                    if (/\d+\.?\d?/.test(item.batteryOrVolts)) {

                        batteryOrVoltsSum += +item.batteryOrVolts;
                        batteryOrVoltsTotal++;

                    } else if (item.battery === 'L' || item.battery === 'K') {

                        batteryOrVoltsSum += 100;
                        batteryOrVoltsTotal++;
                    }

                    if (typeof item.temperature === 'number') {

                        temperatureSum += item.temperature;
                        temperatureTotal++;
                    }
                });

                by.push({
                    label: token,
                    batteryOrVolts: batteryOrVoltsTotal > 0 ? Math.floor(batteryOrVoltsSum / batteryOrVoltsTotal) : null,
                    temperature: temperatureTotal > 0 ? Math.floor(temperatureSum / temperatureTotal) : null
                });
            }
        }

        return by;
    }

    private prepareBatteryOrVoltsData(batteryOrVolts: any) {

        if (/\d+\.?\d?/.test(batteryOrVolts)) {

            return +batteryOrVolts;

        } else if (batteryOrVolts === 'L' || batteryOrVolts === 'K') {

            return 100;
        }
    }
}
