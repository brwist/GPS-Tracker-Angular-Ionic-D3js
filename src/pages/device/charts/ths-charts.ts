import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { ModalController, NavParams } from 'ionic-angular';
import * as moment from 'moment';
import * as momentTimezone from 'moment-timezone';
import { convertFToC, FormatTempPipe } from '../../../pipes/format-temperature/format-temp.pipe';
import { ApiProvider } from '../../../providers/api';
import { IDevice, IMeasurement } from '../../../providers/device';
import { Logger } from '../../../providers/logger';
import { MeasurementProvider } from '../../../providers/measurement';
import { ISettings, Settings } from '../../../providers/settings';
import { UtilsService } from '../../../services/utils.service';
import { ChartBase } from './chart.base';

@Component({
    selector: 'page-ths-charts',
    templateUrl: 'charts.html',
    providers: [FormatTempPipe]
})
export class DeviceTHSChartsPage extends ChartBase implements OnInit {
    public _chartData: any = {};

    get chartData() {
        return this._chartData[this.chartType];
    }
    public settings: ISettings;

    public chartTypes = [
        {
            value: 'temperature',
            label: 'Temperature'
        },
        {
            value: 'humidity',
            label: 'Humidity'
        },
        {
            value: 'battery',
            label: 'Battery'
        }
    ];

    public groupedBy: string;
    public pointsTotal: number;

    public device: IDevice;

    public chartDataColors = {

        // https://stackoverflow.com/questions/39832874/how-do-i-change-the-color-for-ng2-charts
        temperature: [{
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            pointBackgroundColor: 'rgba(54, 162, 235, 1)',
            pointBorderColor: 'rgba(54, 162, 235, 1)',
            pointHoverBackgroundColor: 'rgba(54, 162, 235, 0.5)',
            pointHoverBorderColor: 'rgba(54, 162, 235, 1)'
        }],
        humidity: [{
            backgroundColor: 'rgba(148, 159, 177, 0.2)',
            borderColor: 'rgba(148, 159, 177,1)',
            pointBackgroundColor: 'rgba(148, 159, 177, 1)',
            pointBorderColor: 'rgba(148, 159, 177, 1)',
            pointHoverBackgroundColor: 'rgba(148, 159, 177, 0.5)',
            pointHoverBorderColor: 'rgba(148, 159, 177, 0.8)'
        }],
        battery: [{
            backgroundColor: 'rgba(148, 159, 177, 0.2)',
            borderColor: 'rgba(148, 159, 177,1)',
            pointBackgroundColor: 'rgba(148, 159, 177, 1)',
            pointBorderColor: 'rgba(148, 159, 177, 1)',
            pointHoverBackgroundColor: 'rgba(148, 159, 177, 0.5)',
            pointHoverBorderColor: 'rgba(148, 159, 177, 0.8)'
        }]
    };

    private chartType: string = 'temperature';

    private dataItems;

    constructor(
        protected logger: Logger,
        private params: NavParams,
        protected storage: Storage,
        protected modalCtrl: ModalController,
        private measProvider: MeasurementProvider,
        protected apiProvider: ApiProvider,
        private formatTempPipe: FormatTempPipe,
        private settingsProvider: Settings
    ) {
        super(logger, storage, modalCtrl, apiProvider);

        this.device = this.params.get('device');

        this.sub = this.settingsProvider.settings.subscribe((settings: ISettings) => {
            this.settings = settings;
        });
    }

    protected loadChartData() {
        this.measProvider.getListForChart(this.device.id, {
            filter: {
                startDate:
                    encodeURIComponent(momentTimezone(this.startDate).tz(this.timeZone).startOf('day').format()),
                endDate:
                    encodeURIComponent(momentTimezone(this.endDate).tz(this.timeZone).endOf('day').format())
            },
            select: ['temperature', 'battery', 'humidity', 'createdAt'],
            lean: true
        }).then((data: any) => {

            this.dataItems = data.items;

            this.renderCharts();

        }).catch((err) => {
            this.logger.error(err);
        });
    }

    protected renderCharts() {

        let points;

        this.groupedBy = null;
        console.log(this.maxNumberOfPointsNumber);

        if (this.dataItems.length > this.maxNumberOfPointsNumber) {

            if (moment(this.endDate).diff(this.startDate, 'days') === 0) {

                points = this.groupBy('hour');

            } else {

                points = this.groupBy('day');
            }

        } else {

            points = this.dataItems.map((item: IMeasurement) => {
                return {
                    label: this.formatTimeLabel(item.createdAt, `HH:mm`),
                    fullDate: this.formatTimeLabel(item.createdAt, `M/DD/YYYY, h:mm:ss a`),
                    temperature: item.temperature,
                    battery: item.battery,
                    humidity: item.humidity
                };
            });

            // console.log(points);
        }

        this._chartData = {};

        setTimeout(() => {

            this._chartData.battery = {
                title: 'Battery, %',
                dataSets: [{
                    data: points.map((item: any) => UtilsService.toFixed(item.battery)),
                    label: 'Battery',
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
                            ticks: { min: 0, max: 100 }
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
                                if (points[tooltipItem[0].index].fullDate) {
                                    return points[tooltipItem[0].index].fullDate;
                                } else {
                                    return points[tooltipItem[0].index].label;
                                }
                            }
                        }
                    }
                },
                legend: false,
                colors: this.chartDataColors.battery,
                chartType: 'line'
            };

            this._chartData.humidity = {
                title: 'Humidity, %',
                dataSets: [{
                    data: points.map((item: any) => UtilsService.toFixed(item.humidity)),
                    label: 'Humidity',
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
                            ticks: { min: 0, max: 100 }
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
                                if (points[tooltipItem[0].index].fullDate) {
                                    return points[tooltipItem[0].index].fullDate;
                                } else {
                                    return points[tooltipItem[0].index].label;
                                }
                            }
                        }
                    }
                },
                legend: false,
                colors: this.chartDataColors.humidity,
                chartType: 'line'
            };

            this._chartData.temperature = {
                title: `Temperature, °${this.settings.temperatureFormat}`,
                dataSets: [{
                    data: points.map((item: any) => {
                        const value = item.temperature;

                        return this.settings.temperatureFormat === 'C' ? convertFToC(value) : value;
                    }),
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
                legend: false,
                colors: this.chartDataColors.temperature,
                chartType: 'line'
            };

        }, 100);
    }

    protected groupBy(kind: string) {
        console.log(kind);

        const by = [];
        const raw = {};

        this.groupedBy = kind;
        this.pointsTotal = this.dataItems.length;

        this.dataItems.forEach((item: IMeasurement) => {

            let token = momentTimezone.tz(item.createdAt, this.timeZone).format('h a');

            if (kind === 'day') {
                token = momentTimezone.tz(item.createdAt, this.timeZone).format('MMM, DD');
            }

            if (!raw[token]) raw[token] = [];

            raw[token].push({
                humidity: item.humidity,
                battery: item.battery,
                temperature: item.temperature
            });
        });

        for (const token in raw) {

            if (raw.hasOwnProperty(token)) {

                let batteryTotal = 0;
                let batterySum = 0;

                let humidityTotal = 0;
                let humiditySum = 0;

                let temperatureTotal = 0;
                let temperatureSum = 0;

                raw[token].forEach((item: IMeasurement) => {

                    if (typeof item.battery !== 'undefined') {
                        batterySum += 100;
                        batteryTotal++;
                    }

                    if (typeof item.humidity !== 'undefined') {
                        humiditySum += 100;
                        humidityTotal++;
                    }

                    if (typeof item.temperature !== 'undefined') {
                        temperatureSum += item.temperature;
                        temperatureTotal++;
                    }
                });

                by.push({
                    label: token,
                    temperature: temperatureTotal > 0 ? Math.floor(temperatureSum / temperatureTotal) : null,
                    humidity: humidityTotal > 0 ? Math.floor(humiditySum / humidityTotal) : null,
                    battery: batteryTotal > 0 ? Math.floor(batteryTotal / batterySum) : null
                });
            }
        }

        return by;
    }
}
