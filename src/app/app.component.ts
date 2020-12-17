import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import * as _ from 'lodash';
import { Platform, MenuController, Nav, AlertController, ToastController } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { ApiProvider } from '../providers/api';
import { AboutPage } from '../pages/about';
import { DevicesPage } from '../pages/devices';
import { WelcomePage } from '../pages/welcome';
import { SupportPage } from '../pages/support';
import { SigninPage } from '../pages/signin';
import { AccountPage } from '../pages/account/account';
import { AlertsAndNotificationsPage } from '../pages/alerts-and-notifications';
import { AlertProvider } from '../providers/alert';
import { NotificationProvider } from '../providers/notification';
import { DeviceProvider } from '../providers/device';
import { RuleProvider } from '../providers/rule';
import { Logger } from '../providers/logger';
import { Storage } from '@ionic/storage';
import { ISettings, Settings } from '../providers/settings';
import { SettingsPage } from '../pages/settings';
import { DevicePage } from '../pages/device/device';
import { RulesPage } from '../pages/rules';
import { UtilsService } from '../services/utils.service';
import { LogsPage } from '../pages/logs';
import { InstructionPage } from '../pages/instruction';
import { TrakkitConfigPage } from '../pages/trakkit-config';
import { TrakkitProvider } from '../providers/trakkit';
import { Subscription } from 'rxjs';

declare const window: any;

const SECOND_USE_STORAGE_KEY = 'second-use';

/**
 * Custom messages to api errors
 */
const CUSTOM_API_ERRORS: { [key: string]: { msg: string } } = {
  TimeoutError: {
    msg: `Looks like the server is taking to long to respond,
        this can be caused by either poor connectivity or an error with our servers.
        Please try again in a while`
  }
};

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  public rootPage: typeof TrakkitConfigPage | typeof DevicesPage | typeof SigninPage;

  public isAuthenticated: boolean = false;

  public selectedTheme: string;

  public isOnline: boolean;

  public resumeSubscription: Subscription;

  @ViewChild(Nav) private nav: Nav;

  private suspendAt;

  constructor(
    private platform: Platform,
    private menu: MenuController,
    private apiProvider: ApiProvider,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private alertCtrl: AlertController,
    private alertProvider: AlertProvider,
    private deviceProvider: DeviceProvider,
    private ruleProvider: RuleProvider,
    private storage: Storage,
    private toastCtrl: ToastController,
    private settingsProvider: Settings,
    private notificationProvider: NotificationProvider,
    private logger: Logger,
    private trakkitProvider: TrakkitProvider,
    private cdr: ChangeDetectorRef
  ) {

    this.resumeSubscription = this.platform.resume.subscribe(async () => {
      logger.info('App:onResume');
      const needRedirect = await this.trakkitProvider.isAvailable();

      logger.info(`App:onResume:needRedirect: ${needRedirect}`);

      if (needRedirect) {
        this.nav.setRoot(TrakkitConfigPage);
      }
    });

    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.

      if (this.platform.is('cordova')) {
        this.statusBar.styleDefault();

        this.statusBar.backgroundColorByHexString('#d5d5d5');

        // window.TrakkitCordovaPlugin.getDate((date) => {
        //     console.log(`TrakkitCordovaPlugin.getDate: ${date}`);
        // });
      }

      menu.enable(true);

      this.logger.init({
        logLevel: 4
      });

      this.settingsProvider.init();

      apiProvider.user.subscribe((user) => {
        this.isAuthenticated = apiProvider.isAuthenticated;

        if (apiProvider.isAuthenticated) {
          if (this.platform.is('cordova')) {
            apiProvider.pushInit();
          }
        } else {
          this.storage
            .get(SECOND_USE_STORAGE_KEY)
            .then((secondUse: boolean) => {
              if (secondUse) {
                this.openPage({ component: SigninPage });
              } else {
                this.openPage({ component: WelcomePage });
              }

              this.storage.set(SECOND_USE_STORAGE_KEY, true).catch((err) => {
                this.logger.error(err);
              });
            })
            .catch((err) => {
              this.logger.error(err);
            });

          this.settingsProvider.settings.take(1).subscribe((settings: ISettings) => {
            if (settings.lastOpenedDeviceId) {
              delete settings.lastOpenedDeviceId;
              this.settingsProvider.saveSettings(settings);
            }
          });
        }
      });

      apiProvider.apiError().subscribe(async (err) => await this.handleApiError(err));
      alertProvider.apiError().subscribe(async (err) => await this.handleApiError(err));
      deviceProvider.apiError().subscribe(async (err) => await this.handleApiError(err));
      ruleProvider.apiError().subscribe(async (err) => await this.handleApiError(err));
      notificationProvider.apiError().subscribe(async (err) => await this.handleApiError(err));

      apiProvider
        .init()
        .then(async (token) => {
          if (this.platform.is('cordova')) {
            this.splashScreen.hide();
          }

          const needRedirect = await this.trakkitProvider.isAvailable();

          if (apiProvider.isAuthenticated) {
            this.settingsProvider.settings.take(1).subscribe(async (settings: ISettings) => {

              this.rootPage = needRedirect ? TrakkitConfigPage : DevicesPage;

              if (
                // if root page is trakkit config page we don't have to change root page and do any redirect
                this.rootPage.name !== TrakkitConfigPage.name &&
                UtilsService.featureFlags().pushLastOpenedDevicePage
              ) {
                if (settings.lastOpenedDeviceId) {
                  setTimeout(() => {
                    this.nav.push(DevicePage, { id: settings.lastOpenedDeviceId });
                  }, 100);
                }
              }
            });
          } else {
            if (needRedirect) {
              setTimeout((x) => {
                this.openTrakkitConfigPage();
              }, 200);
            } else {
              this.rootPage = SigninPage;
            }
          }
        })
        .catch(async (err) => {
          const needRedirect = await this.trakkitProvider.isAvailable();

          this.logger.error(err);

          if (needRedirect) {
            setTimeout((x) => {
              this.openTrakkitConfigPage();
            }, 200);
          }
        });

      // Handle PUSH notifications in a foreground
      this.apiProvider.pushNotification().subscribe((data) => {
        // console.log('PUSH RECEIVED', data);

        if (
          _.get(data, 'additionalData.notificationType') === 'rule' ||
          _.get(data, 'additionalData.notificationType') === 'firstAlert'
        ) {
          // console.log(data);

          this.toastCtrl
            .create({
              message: this.platform.is('ios') ? data.message : data.title,
              position: `top`,
              duration: 2000,
              dismissOnPageChange: true
            })
            .present()
            .catch((err) => {
              console.log(err);
            });
        } else {
          console.log(`Unexpected PUSH notification received:`);
          console.log(data);
        }
      });

      this.settingsProvider.getActiveTheme().subscribe((theme: string) => {
        this.selectedTheme = theme;
      });

      this.platform.pause.subscribe(() => {
        this.apiProvider.suspend();

        this.suspendAt = new Date();
      });

      this.platform.resume.subscribe(() => {
        const diffImMs = new Date().getTime() - this.suspendAt.getTime();

        if (diffImMs > 1000 * 60 * 60 * 3) {
          // 3h

          window.location.reload();
        } else {
          this.apiProvider.init();
        }
      });

      this.apiProvider.isOnline.subscribe((isOnline: boolean) => {
        this.isOnline = isOnline;
      });
    });
  }

  public openDevicesPage() {
    this.nav.setRoot(DevicesPage);
  }

  public openRulesPage() {
    this.nav.setRoot(RulesPage);
  }

  public openAlertsAndNotificationsPage() {
    this.nav.setRoot(AlertsAndNotificationsPage);
  }

  public openAccountPage() {
    this.nav.setRoot(AccountPage);
  }

  public openAboutPage() {
    this.nav.setRoot(AboutPage);
  }

  public openLogsPage() {
    this.nav.setRoot(LogsPage);
  }

  public openSettingsPage() {
    this.nav.setRoot(SettingsPage);
  }

  public openTrakkitConfigPage() {
    this.nav.setRoot(TrakkitConfigPage);
  }

  public openInstructionPage() {
    this.nav.setRoot(InstructionPage);
  }

  public openSupportPage() {
    this.nav.setRoot(SupportPage);
  }

  private openPage(page) {
    this.nav.setRoot(page.component);
  }

  private async handleApiError(err) {
    const needRedirect = await this.trakkitProvider.isAvailable();

    if (needRedirect) {
      this.openPage(TrakkitConfigPage);
      return;
    }

    if (err.status === 401) {
      this.apiProvider.logOut();

      return;
    }

    if (err.status === 400 && err.error && err.error.error) {
      this.alertCtrl
        .create({
          title: err.error.error,
          buttons: [
            {
              text: 'Ok'
            }
          ]
        })
        .present();

      return;
    }

    if (err.error === 'Internet is required.') {
      this.toastCtrl
        .create({
          message: `No Internet connection`,
          duration: 1000,
          position: 'bottom'
        })
        .present();

      return;
    }

    if (err.status === 0) {
      this.toastCtrl
        .create({
          message: `Could not connect to the server`,
          duration: 1000,
          position: 'bottom'
        })
        .present();

      return;
    }

    let errorString;

    try {
      errorString = err.json().error;
    } catch (err2) {
      // ignore
      errorString = JSON.stringify(err);
    }

    if (CUSTOM_API_ERRORS[err.name]) {
      errorString = CUSTOM_API_ERRORS[err.name].msg;
    }

    this.alertCtrl
      .create({
        title: `API Error`,
        message: errorString,
        buttons: [
          {
            text: 'OK',
            role: 'cancel'
          }
        ]
      })
      .present();

    this.logger.error(err);
  }
}
