import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Loading, LoadingController, ModalController, NavController, NavParams } from 'ionic-angular';
import * as moment from 'moment';
import * as momentTimezone from 'moment-timezone';
import { convertFToC, FormatTempPipe } from '../../../pipes/format-temperature/format-temp.pipe';
import { ApiProvider, IUserInfo } from '../../../providers/api';
import { DeviceProvider, IDevice, IMeasurement } from '../../../providers/device';
import { Logger } from '../../../providers/logger';
import { MeasurementProvider } from '../../../providers/measurement';
import { ISettings, Settings } from '../../../providers/settings';
import { UtilsService } from '../../../services/utils.service';
import { ChartBase } from './chart.base';

const DATE_SETTINGS_STORAGE_KEY = 'device-date-settings-for-charts';
const MAX_ITEMS_PER_DAY_STORAGE_KEY = 'max-items-per-day';
const SETTINGS_STORAGE_TOKEN = 'settings';

import * as async from 'async';
import { Subscription } from 'rxjs';
import { IDateSettings } from '../device';
import { TrackProvider } from '../../../providers/track';
import { DateSettingsPage } from '../date-settings';
import { BaseComponent } from '../../../app/base-component';

@Component({
  selector: 'page-ths-charts',
  templateUrl: 'charts.html',
  providers: [FormatTempPipe]
})
export class DeviceTHSChartsPage extends BaseComponent implements OnInit {
  public chartData: any = {};
  public groupedBy: string;
  public pointsTotal: number;

  public device: IDevice;

  public maxNumberOfPointsModel: number | string;
  public activeTab = 2;
  public rangeDateStart: any;
  public rangeDateEnd: any;
  public datePipeFormat = 'MMM d h:mm a';
  private data: any;

  public dataYear: any[] = [];

  private userSubscription: Subscription;

  private timeZone: string = momentTimezone.tz.guess();

  private dateSettings: IDateSettings = {
    type: 'day',
    value: 'today',
    startDate: moment(),
    endDate: moment()
  };

  private startDate: any;
  private endDate: any;
  // private yearSelected = false;
  private loader: Loading;
  yearPoints: any;
  tempUnit = 'fTemp';
  thsType = 'humidity';
  dataLoading: boolean = true;
  isGps: boolean;
  maxPeriodAvailable: number;
  loadingMessage: string = 'Sending request';
  isNightTheme: boolean;
  allSettings: ISettings;
  noDataCounter = 0;
  isNoData = false;

  constructor(
    private logger: Logger,
    private params: NavParams,
    private loadingCtrl: LoadingController,
    private storage: Storage,
    private apiProvider: ApiProvider,
    private deviceProvider: DeviceProvider,
    private measProvider: MeasurementProvider,
    private settingsProvider: Settings
  ) {
    super();
    this.isGps = false;
    this.deviceProvider.setChartType('gps');
    this.device = this.params.get('device');
  }

  public ngOnInit() {
    this.settingsProvider.getActiveTheme().take(1).subscribe((theme: string) => {
      this.isNightTheme = theme === 'night-theme' ? true : false;
    });
    this.storage
      .set(MAX_ITEMS_PER_DAY_STORAGE_KEY, 'All')
      .then(() => {
        this.maxNumberOfPointsModel = 'All';

        this.renderCharts();
      })
      .catch((err) => {
        this.logger.error(err);
      });
    async.series(
      [
        (callback) => {
          this.storage
            .get(DATE_SETTINGS_STORAGE_KEY)
            .then((dateSettings?: IDateSettings) => {
              if (dateSettings) {
                this.dateSettings = dateSettings;

                if (this.dateSettings.type !== 'custom') {
                  const updatedDateRange = DateSettingsPage.getDateRange(this.dateSettings.value);

                  if (updatedDateRange) {
                    this.dateSettings.startDate = updatedDateRange.startDate;
                    this.dateSettings.endDate = moment(updatedDateRange.endDate).add(1, 'hours');
                  }
                }
              }

              callback();
            })
            .catch((err) => {
              callback(err);
            });
        },
        (callback) => {
          this.storage
            .get(MAX_ITEMS_PER_DAY_STORAGE_KEY)
            .then((maxNumberOfPoints?: number) => {
              if (maxNumberOfPoints) {
                this.maxNumberOfPointsModel = maxNumberOfPoints;
              } else {
                this.maxNumberOfPointsModel = 50;
              }

              callback();
            })
            .catch((err) => {
              callback(err);
            });
        }
      ],
      (err) => {
        if (err) this.logger.error(err);

        this.loadChartData();
      }
    );

    this.userSubscription = this.apiProvider.user.subscribe((user: IUserInfo) => {
      if (user && user.timeZone) {
        this.timeZone = user.timeZone;
      }
    });

    this.sub = this.settingsProvider.settings.subscribe((settings: ISettings) => {
      this.allSettings = settings;
      if (!settings.temperatureFormat) {
        this.allSettings.temperatureFormat = 'F';
        this.settingsProvider.saveSettings(this.allSettings);
      } else {
        this.tempUnit = settings.temperatureFormat === 'C' ? 'cTemp' : 'fTemp';
      }
    });
  }

  public ngOnDestroy() {
    this.userSubscription.unsubscribe();
  }

  private loadChartData() {
    this.showLoader();
    this.loadChartYear();
  }

  private showLoader() {
    this.loader = this.loadingCtrl.create({ content: this.loadingMessage });

    this.loader.present();
  }

  private hideLoader() {
    this.loader.dismiss();
  }

  private loadChartYear() {
    if (this.dataYear.length > 0) {
      return;
    }
    const currentTime = moment().format();
    const start = moment(currentTime).add(-1, 'year');
    const end = moment(currentTime);
    const select = ['temperature', 'battery', 'humidity', 'createdAt'];

    this.loadingMessage = 'Waiting callback';
    this.loader.setContent(this.loadingMessage);

    this.measProvider
      .getListForChart(this.device.id, {
        filter: {
          startDate: encodeURIComponent(momentTimezone(start).tz(this.timeZone).format()),
          endDate: encodeURIComponent(momentTimezone(end).tz(this.timeZone).format())
        },
        select,
        lean: true
      })
      .then((data: any) => {
        this.loadingMessage = 'Data recieved';
        this.loader.setContent(this.loadingMessage);
        this.dataYear = data.items.map((item: IMeasurement) => {
          return {
            timestamp: item.createdAt,
            temperature: item.temperature,
            battery: item.battery,
            humidity: item.humidity
          };
        });

        const minDate = this.dataYear[0] ? this.dataYear[0].timestamp : undefined;
        const maxDate = this.dataYear[this.dataYear.length - 1]
          ? this.dataYear[this.dataYear.length - 1].timestamp
          : undefined;

        if (minDate && maxDate) {
          const min = moment(minDate);
          const max = moment(maxDate);
          this.maxPeriodAvailable = max.diff(min, 'day');
        }

        this.renderCharts();
      })
      .catch((err) => {
        this.logger.error(err);
      });
  }

  private renderCharts() {
    this.loadingMessage = 'Processing data';
    if(this.loader) {
      this.loader.setContent(this.loadingMessage);
    }
    setTimeout(() => {
      this.loadData(this.dataYear);
    },);
  }

  loadData(data) {
    let points;
    if (!data || data.length <= 0) {
      this.noDataCounter++;
      if (this.noDataCounter > 1) {
        this.isNoData = true;
        this.handleNoData();
      }
      console.log('no data');
      return;
    }

    this.isNoData = false;
    this.groupedBy = null;
    points = data;

    this.chartData = {};
    setTimeout(() => {
      let humidity = [];
      let temperature = [];
      let battery = [];
      if (points) {
        humidity = points
          .filter((item) => {
            if (!item.humidity) {
              return false;
            }
            return true;
          })
          .map((item) => {
            return {
              sortTime: new Date(item.timestamp).getTime(),
              humidity: item.humidity
            };
          })
          .sort((a, b) => (a.sortTime > b.sortTime ? -1 : b.sortTime > a.sortTime ? 1 : 0));

        temperature = points
          .filter((item) => {
            if (!item.temperature) {
              return false;
            }
            return true;
          })
          .map((item) => {
            if (!item.temperature) {
              console.log(item.temperature);
              return;
            }
            return {
              sortTime: new Date(item.timestamp).getTime(),
              temperature: this.tempUnit === 'cTemp' ? ((item.temperature - 32) * 5) / 9 : item.temperature
            };
          })
          .sort((a, b) => (a.sortTime > b.sortTime ? -1 : b.sortTime > a.sortTime ? 1 : 0));

          battery = points
          .filter((item) => {
            if (!item.battery) {
              return false;
            }
            return true;
          })
          .map((item) => {
            if (!item.battery) {
              console.log(item.battery);
              return;
            }
            return {
              sortTime: new Date(item.timestamp).getTime(),
              battery: item.battery
            };
          })
          .sort((a, b) => (a.sortTime > b.sortTime ? -1 : b.sortTime > a.sortTime ? 1 : 0));
      }

      this.chartData.humidity = humidity;
      this.chartData.temperature = temperature;
      this.chartData.battery = battery;
      this.loadingMessage = 'Creating chart';
      this.loader.setContent(this.loadingMessage);
      this.selectTimeDurationDay(2);
      this.dataLoading = false;
      this.hideLoader();
    }, 100);
  }

  handleNoData() {
    this.loadingMessage = 'No Data';
    this.loader.setContent(this.loadingMessage);
    this.dataLoading = false;
    this.hideLoader();
  }

  rangeTimeChange(event) {
    this.rangeDateStart = moment(event.start).isValid() ? moment(event.start) : undefined;
    this.rangeDateEnd = moment(event.end).isValid() ? moment(event.end) : undefined;
  }

  public selectTimeDurationHour(tab) {
    this.datePipeFormat = 'MMM d h:mm a';
    this.activeTab = tab;
    const currentTime = moment().format();
    const start = moment(currentTime).add(-1, 'hours');
    const end = moment(currentTime);
    this.dateSettings.startDate = start;
    this.dateSettings.endDate = end;
    this.storage.set(DATE_SETTINGS_STORAGE_KEY, this.dateSettings).catch((err) => {
      this.logger.error(err);
    });
    this.rangeDateStart = start;
    this.rangeDateEnd = end;

    this.deviceProvider.setSelectedRange('hour');
    // this.loadChartData();
  }

  public selectTimeDurationDay(tab) {
    this.datePipeFormat = 'MMM d h:mm a';
    this.activeTab = tab;
    const currentTime = moment().format();
    const start = moment(currentTime).add(-1, 'day');
    const end = moment(currentTime);
    this.dateSettings.startDate = start;
    this.dateSettings.endDate = end;
    this.storage.set(DATE_SETTINGS_STORAGE_KEY, this.dateSettings).catch((err) => {
      this.logger.error(err);
    });
    this.rangeDateStart = start;
    this.rangeDateEnd = end;

    this.deviceProvider.setSelectedRange('day');
    // this.loadChartData();
  }

  public selectTimeDurationWeek(tab) {
    this.datePipeFormat = 'MMM d h:mm a';
    this.activeTab = tab;
    const currentTime = moment().format();
    const start = moment(currentTime).add(-1, 'week');
    const end = moment(currentTime);

    this.dateSettings.startDate = start;
    this.dateSettings.endDate = end;
    this.storage.set(DATE_SETTINGS_STORAGE_KEY, this.dateSettings).catch((err) => {
      this.logger.error(err);
    });
    this.rangeDateStart = start;
    this.rangeDateEnd = end;

    this.deviceProvider.setSelectedRange('week');
    // this.loadChartData();
  }

  public selectTimeDurationMonth(tab) {
    this.datePipeFormat = 'MMM d h:mm a';
    this.activeTab = tab;
    const currentTime = moment().format();
    const start = moment(currentTime).add(-1, 'month');
    const end = moment(currentTime);
    this.dateSettings.startDate = start;
    this.dateSettings.endDate = end;
    this.storage.set(DATE_SETTINGS_STORAGE_KEY, this.dateSettings).catch((err) => {
      this.logger.error(err);
    });
    this.rangeDateStart = start;
    this.rangeDateEnd = end;

    this.deviceProvider.setSelectedRange('month');
    // this.loadChartData();
  }

  public selectTimeDurationYear(tab) {
    if (this.dataYear.length <= 0) {
      return;
    }
    this.datePipeFormat = 'MMM d, y, h:mm a';
    this.activeTab = tab;
    const currentTime = moment().format();
    const start = moment(currentTime).add(-1, 'year');
    const end = moment(currentTime);
    this.dateSettings.startDate = start;
    this.dateSettings.endDate = end;
    this.storage.set(DATE_SETTINGS_STORAGE_KEY, this.dateSettings).catch((err) => {
      this.logger.error(err);
    });
    this.rangeDateStart = start;
    this.rangeDateEnd = end;

    this.deviceProvider.setSelectedRange('year');

    // this.loadChartData();
  }

  fToC(type) {
    if (this.tempUnit === type) {
      return;
    }
    this.settingsProvider.convertTemperature();
    this.deviceProvider.setTempType(type);
    this.tempUnit = type;
    const tempdata = JSON.stringify(this.chartData.temperature);
    const data = JSON.parse(tempdata);

    this.chartData.temperature = undefined;

    data.forEach((item) => {
      item.temperature = ((item.temperature - 32) * 5) / 9;
    });

    setTimeout(() => {
      this.chartData.temperature = data;
    }, 100);
  }

  cToF(type) {
    if (this.tempUnit === type) {
      return;
    }
    this.settingsProvider.convertTemperature();
    this.deviceProvider.setTempType(type);
    this.tempUnit = type;
    const tempdata = JSON.stringify(this.chartData.temperature);
    const data = JSON.parse(tempdata);

    this.chartData.temperature = undefined;

    data.forEach((item) => {
      item.temperature = (item.temperature * 9) / 5 + 32;
    });

    setTimeout(() => {
      this.chartData.temperature = data;
    }, 100);
  }

  chageTHSType(type) {
      this.thsType = type;
  }
}
