import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule } from 'ionic-angular';
import { IonicStorageModule } from '@ionic/storage';
import { MomentModule } from 'angular2-moment';
import { Push } from '@ionic-native/push';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { AppVersion } from '@ionic-native/app-version';
import { Geolocation } from '@ionic-native/geolocation';
import { NativeRingtones } from '@ionic-native/native-ringtones';
import { Device } from '@ionic-native/device';
import { UniqueDeviceID } from '@ionic-native/unique-device-id';
// import { ImagePicker } from '@ionic-native/image-picker';
import { Base64 } from '@ionic-native/base64';
import { Keyboard } from '@ionic-native/keyboard';
import { ChartsModule } from 'ng2-charts/ng2-charts';
import { OpenNativeSettings } from '@ionic-native/open-native-settings/ngx';
import { NetworkInterface } from '@ionic-native/network-interface';

import { MyApp } from './app.component';
import { WelcomePage } from '../pages/welcome';
import { SupportPage } from '../pages/support';
import { AccountPage } from '../pages/account/account';
import { AccountPasswordPage } from '../pages/account/password';
import { AccountEmailPage } from '../pages/account/email';
import { AccountPhonePage } from '../pages/account/phone';
import { AccountEmailsPage } from '../pages/account/emails';
import { AccountPhonesPage } from '../pages/account/phones';
import { NewPhonePage } from '../pages/account/phones/new-phone';
import { AccountEditPage } from '../pages/account/personal-info/personal-info';
import { TimeZonePickerPage } from '../pages/account/personal-info/timezone-picker';
import { SettingsPage } from '../pages/settings';
import { RingtonPickerPage } from '../pages/settings/ringtone-picker';
import { SignUpPage } from '../pages/signup';
import { SigninPage } from '../pages/signin';
import { DevicesPage } from '../pages/devices';
import { DevicesPopoverPage } from '../pages/devices/popover';
import { DevicePage } from '../pages/device/device';
import { DateSettingsPage } from '../pages/device/date-settings';
import { DeviceTracksPage } from '../pages/device/tracks';
import { DeviceGPSChartsPage , DeviceTHSChartsPage} from '../pages/device/charts';
import { HelpModal } from '../pages/device/help-modal';
import { TrackPage } from '../pages/device/tracks/track';
import { RulesPage } from '../pages/rules';
import { RulesPopoverPage } from '../pages/rules/popover';
import { TrackingOptionsPage } from '../pages/device/tracking-options';
import { RulesEditorPage } from '../pages/rules/rule-editor';
import { CreateDevicePage } from '../pages/device/create/create-device';
import { EditDevicePage } from '../pages/device/edit/edit-device';
import { LatestVersionPage } from '../pages/device/latest-version';
import { DeviceSharePage } from '../pages/device/share';
import { ShareWithUserPage } from '../pages/device/share/share-with-user';

import { TemperatureConditionPage } from '../pages/rules/common/conditions/temperature/temperature';
import { SpeedConditionPage } from '../pages/rules/common/conditions/speed/speed';
import { NTC1ConditionPage } from '../pages/rules/common/conditions/ntc1/ntc1';
import { VoltsConditionPage } from '../pages/rules/common/conditions/volts/volts';
import { MotionConditionPage } from '../pages/rules/common/conditions/motion/motion';
import { GeoZoneConditionPage } from '../pages/rules/common/conditions/geo-zone/geo-zone';
import { BatteryConditionPage } from '../pages/rules/common/conditions/battery';
import { StateChangeConditionPage } from '../pages/rules/common/conditions/state-change';
import { ReeferHoursConditionPage } from '../pages/rules/common/conditions/reefer-hours';

import { EmailActionPage } from '../pages/rules/common/action/email/email';
import { SmsActionPage } from '../pages/rules/common/action/sms/sms';
import { PushActionPage } from '../pages/rules/common/action/push/push';
import { WebPushActionPage } from '../pages/rules/common/action/web-push/web-push';

import { EmailNotificationPage } from '../pages/device/tracking-options/common/notifications/email';
import { SmsNotificationPage } from '../pages/device/tracking-options/common/notifications/sms';
import { PushNotificationPage } from '../pages/device/tracking-options/common/notifications/push';
import { WebPushNotificationPage } from '../pages/device/tracking-options/common/notifications/web-push';

import { AboutPage } from '../pages/about';
import { InstructionPage } from '../pages/instruction';
import { TrakkitConfigPage } from '../pages/trakkit-config';
import { LogsPage } from '../pages/logs';
import { AlertsAndNotificationsPage } from '../pages/alerts-and-notifications';
import { AlertOrNotificationPopoverPage } from '../pages/alerts-and-notifications/popover';
import { AlertPage } from '../pages/alerts-and-notifications/alert/alert';
import { NotificationPage } from '../pages/alerts-and-notifications/notification';
import { DeviceProvider } from '../providers/device';
import { RuleProvider } from '../providers/rule';
import { ApiProvider } from '../providers/api';
import { AlertProvider } from '../providers/alert';
import { NotificationProvider } from '../providers/notification';
import { TrackProvider } from '../providers/track';
import { Logger } from '../providers/logger';
import { Settings } from '../providers/settings';
import { TrakkitProvider } from '../providers/trakkit';
import { Network } from '@ionic-native/network';
import { HTTP } from '@ionic-native/http';

import { GlobalErrorHandler } from '../providers/global-error-handler';
import { OfflineInterceptor } from './OfflineInterceptor';

import '../../node_modules/chart.js/dist/Chart.bundle.js';
import { FirstAlertProvider } from '../providers/first-alert';

import * as Sentry from '@sentry/browser';
import { DevicesListItemComponent } from '../pages/devices/item';
import { DeviceCircleChartPage } from '../pages/device/circle-chart';
import { FormatTempModule } from '../pipes/format-temperature/format-temp.module';
import { CamelCostModule } from '../pipes/camel-cost/camel-cost.module';
import { MeasurementsModule } from '../pages/device/measurements/measurements.module';
import { MeasurementProvider } from '../providers/measurement';
import { HumidityConditionPage } from '../pages/rules/common/conditions/humidity/humidity'
import { TemperatureChartComponent } from '../pages/device/charts/temperature-chart/temperature-chart';
import { VoltChartComponent } from '../pages/device/charts/volt-chart/volt-chart';
import { DecimalPipe } from '@angular/common';
import { HumidityChartComponent } from '../pages/device/charts/humidity/humidity-chart';
import { BatteryChartComponent } from '../pages/device/charts/battery/battery-chart';

// @mergeTHS
Sentry.init({
    dsn: 'https://d8f1c773c46d4b6c91ad8604bc4f90b1@sentry.io/2299214'
});

@NgModule({
    declarations: [
        MyApp,
        AboutPage,
        InstructionPage,
        TrakkitConfigPage,
        LogsPage,
        WelcomePage,
        SupportPage,
        AccountPage,
        AccountPasswordPage,
        AccountEmailPage,
        AccountPhonePage,
        AccountEmailsPage,
        AccountPhonesPage,
        NewPhonePage,
        AccountEditPage,
        TimeZonePickerPage,
        SettingsPage,
        RingtonPickerPage,
        SignUpPage,
        SigninPage,
        CreateDevicePage,
        EditDevicePage,
        DevicesPage,
        DevicesListItemComponent,
        DevicesPopoverPage,
        DeviceCircleChartPage,

        DevicePage,
        DateSettingsPage,
        DeviceTracksPage,
        DeviceGPSChartsPage,
        DeviceTHSChartsPage,
        DeviceSharePage,
        HelpModal,
        ShareWithUserPage,
        TrackPage,
        RulesPage,
        RulesPopoverPage,
        TrackingOptionsPage,
        RulesEditorPage,
        LatestVersionPage,
        TemperatureChartComponent,
        VoltChartComponent,
        HumidityChartComponent,
        BatteryChartComponent,

        TemperatureConditionPage,
        HumidityConditionPage,
        SpeedConditionPage,
        NTC1ConditionPage,
        VoltsConditionPage,
        MotionConditionPage,
        GeoZoneConditionPage,
        BatteryConditionPage,
        StateChangeConditionPage,
        ReeferHoursConditionPage,

        EmailActionPage,
        SmsActionPage,
        PushActionPage,
        WebPushActionPage,

        EmailNotificationPage,
        SmsNotificationPage,
        PushNotificationPage,
        WebPushNotificationPage,

        AlertsAndNotificationsPage,
        AlertOrNotificationPopoverPage,
        AlertPage,
        NotificationPage
    ],
    imports: [
        BrowserModule,
        IonicModule.forRoot(MyApp),
        IonicStorageModule.forRoot(),
        HttpClientModule,
        MomentModule,
        ChartsModule,
        FormatTempModule,
        CamelCostModule,
        MeasurementsModule
    ],
    bootstrap: [IonicApp],
    entryComponents: [
        MyApp,
        AboutPage,
        InstructionPage,
        TrakkitConfigPage,
        LogsPage,
        WelcomePage,
        SupportPage,
        AccountPage,
        AccountPasswordPage,
        AccountEmailPage,
        AccountPhonePage,
        AccountEmailsPage,
        AccountPhonesPage,
        NewPhonePage,
        AccountEditPage,
        TimeZonePickerPage,
        SettingsPage,
        RingtonPickerPage,
        SignUpPage,
        SigninPage,
        CreateDevicePage,
        EditDevicePage,
        DevicesPage,
        DevicesPopoverPage,
        DevicePage,
        DateSettingsPage,
        DeviceTracksPage,
        DeviceGPSChartsPage,
        DeviceTHSChartsPage,
        DeviceSharePage,
        HelpModal,
        ShareWithUserPage,
        TrackPage,
        RulesPage,
        RulesPopoverPage,
        TrackingOptionsPage,
        RulesEditorPage,
        LatestVersionPage,

        TemperatureConditionPage,
        HumidityConditionPage,
        SpeedConditionPage,
        NTC1ConditionPage,
        VoltsConditionPage,
        MotionConditionPage,
        GeoZoneConditionPage,
        BatteryConditionPage,
        StateChangeConditionPage,
        ReeferHoursConditionPage,

        EmailActionPage,
        SmsActionPage,
        PushActionPage,
        WebPushActionPage,

        EmailNotificationPage,
        SmsNotificationPage,
        PushNotificationPage,
        WebPushNotificationPage,

        AlertsAndNotificationsPage,
        AlertOrNotificationPopoverPage,
        AlertPage,
        NotificationPage
    ],
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: OfflineInterceptor,
            multi: true
        },
        {
            provide: ErrorHandler,
            useClass: GlobalErrorHandler
        },

        Network,
        NetworkInterface,
        TrakkitProvider,
        HTTP, DecimalPipe,
        SplashScreen, StatusBar, Push, ApiProvider, DeviceProvider, RuleProvider, AlertProvider, TrackProvider,
        NotificationProvider, Logger, AppVersion, Geolocation, Settings, NativeRingtones, Device, /*ImagePicker,*/
        Base64, UniqueDeviceID, Keyboard, OpenNativeSettings, FirstAlertProvider,

        MeasurementProvider
    ]
})
export class AppModule {
}
