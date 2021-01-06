import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import {
    NavController, NavParams, Platform, ModalController,
    ActionSheetController, LoadingController, AlertController
} from 'ionic-angular';
import { IDevice, DeviceProvider, ITrack, IFirstAlert } from '../../providers/device';
import { TrackProvider, trackSources } from '../../providers/track';
import { EditDevicePage } from './edit/edit-device';
import { RulesPage } from '../rules';
import { TrackingOptionsPage } from './tracking-options';
import { Storage } from '@ionic/storage';
import { Logger } from '../../providers/logger';
import { NotificationFactory } from '../../app/notifications/notification-factory';
import { Subscription } from 'rxjs';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
import { ISettings, Settings } from '../../providers/settings';
import { ApiProvider, IDeviceLocation, IFirmwareUpdateInfo, IUserInfo } from '../../providers/api';
import { LatestVersionPage } from './latest-version';
import { DeviceTracksPage } from './tracks';
import { DeviceGPSChartsPage, DeviceTHSChartsPage } from './charts';
import { NativeRingtones } from '@ionic-native/native-ringtones';
import { DateSettingsPage } from './date-settings';
import { UtilsService } from '../../services/utils.service';
import { DeviceSharePage } from './share';
import { HelpModal } from './help-modal';
import * as moment from 'moment';
import * as momentTimezone from 'moment-timezone';
import * as async from 'async';

import * as L from 'leaflet';
import 'leaflet-rotatedmarker';
import 'leaflet.markercluster';
import 'leaflet.gridlayer.googlemutant';
import 'leaflet-fullscreen';
import { debounceTime, filter } from 'rxjs/operators';
import { MeasurementsPage } from './measurements/measurements';
// import 'leaflet-canvas-marker';

const DATE_SETTINGS_STORAGE_KEY = 'device-date-settings';
const SHOW_GPS_LOGS_KEY = 'show-gps-logs';
const SHOW_DETAILS_KEY = 'show-ths-details';

export interface IDateSettings {
    type: string;
    value: any;
    startDate: any;
    endDate: any;
}

@Component({
    selector: 'page-device',
    templateUrl: 'device.html'
})
export class DevicePage implements OnInit {

    public device: IDevice;

    public noMapMessage: string = 'Loading..';

    public mapRecenterPaused: boolean = false;

    public mapCenter: number[];

    public shownTrack: ITrack;

    public settings: ISettings;

    public firmwareUpdateInfo: IFirmwareUpdateInfo;

    public mapPaddingiOS: boolean = false;

    public geoPositionData: Geoposition;
    /** current first alert */
    public firstAlert: IFirstAlert;

    private id: string;

    private mapBounds: any;

    private currentBaseLayer: any;

    private resumeRecenterControlText: any;

    private map: any;

    private deviceMarker: any;

    private currentTrackMarker: any;

    private showTelemetryModel: boolean;

    private showDebugInformationModel: boolean;

    private markers: any;

    // private markersLayer: any;

    // private shownMarkers: any = [];

    private leafletRecenter: boolean = false;

    private currentUserPosition: any;

    private currentUserPositionMarker: any;

    private currentUserAccuracyMarker: any;

    private previousTrack: ITrack;

    private activeTheme: string;

    private roadMutant: any;

    private nightMutant: any;

    private dateSettings: IDateSettings = {
        type: 'day',
        value: 'today',
        startDate: moment(),
        endDate: moment()
    };

    private timeZone: string = momentTimezone.tz.guess();

    private mapLoaded: boolean = false;

    private userSubscription: Subscription;
    private activeThemeSubscription: Subscription;
    private watchPositionSubscription: Subscription;
    private deviceLocationSubscription: Subscription;
    private firstAlertSubscription: Subscription;
    private settingSubscription: Subscription;

    constructor(
        private navCtrl: NavController,
        private params: NavParams,
        private deviceProvider: DeviceProvider,
        private actionSheetCtrl: ActionSheetController,
        private loadingCtrl: LoadingController,
        private storage: Storage,
        private settingsProvider: Settings,
        private apiProvider: ApiProvider,
        private logger: Logger,
        private ngZone: NgZone,
        private platform: Platform,
        private modalCtrl: ModalController,
        private ringtones: NativeRingtones,
        private geolocation: Geolocation,
        private trackProvider: TrackProvider,
        private alertCtrl: AlertController
    ) { }

    get dateRangeString() {

        if (!this.dateSettings || !this.dateSettings.startDate || !this.dateSettings.endDate) return 'Date range unknown';

        if (!moment(this.dateSettings.startDate).isValid() || !moment(this.dateSettings.endDate).isValid()) {

            this.logger
                .warning(`GET:dateRangeString: one of date is invalid. "${this.dateSettings.startDate}" - "${this.dateSettings.endDate}"`);

            return 'Date range unknown';
        }

        return moment(this.dateSettings.startDate).format('MMM D') + ' - ' + moment(this.dateSettings.endDate).format('MMM D');
    }

    get deviceStatusCodeString() {

        if (this.device && this.device.code) {

            return DeviceProvider.codeToString(this.device.code.value);

        } else {

            return 'Unknown';
        }
    }

    get deviceMapZoomKey() {

        return `deviceMapZoom-${this.id}`;
    }

    get mapZoom() {

        if (localStorage.getItem(this.deviceMapZoomKey)) {

            return parseInt(localStorage.getItem(this.deviceMapZoomKey), 10);

        } else {

            return 15;
        }
    }

    get showGPSLogs() {

        if (localStorage.getItem(SHOW_GPS_LOGS_KEY + `-${this.id}`)) {

            return localStorage.getItem(SHOW_GPS_LOGS_KEY + `-${this.id}`) === 'true';

        } else {

            return true;
        }
    }

    set showGPSLogs(value) {

        localStorage.setItem(SHOW_GPS_LOGS_KEY + `-${this.id}`, value ? 'true' : 'false');

        this.fetchTracksByBoundsArea();
    }

    get showDetails() {
        const storedValue = localStorage.getItem(SHOW_DETAILS_KEY + `-${this.id}`);

        return storedValue ? storedValue === 'true' : true;
    }

    set showDetails(value) {
        localStorage.setItem(SHOW_DETAILS_KEY + `-${this.id}`, value ? 'true' : 'false');
    }

    get isNightTheme() {

        return this.activeTheme === 'night-theme';
    }

    get showTrackingModeButton() {

        if (!this.device) return false;
        if (!this.device.lastTrack) return true;
        if (!this.device.code) return false;

        // Disable Trakkit Mode button (for all apps) if Cable Kit in use, since Cable Kit uses Hybrid Tracking and GPS Logging automatically.
        if (this.device.lastTrack.battery === 'K') return false;

        return true;
    }

    // @TODO huge kostil
    get isGps() {
        return this.device && this.device.type === 'GPS';
    }

    public ngOnInit() {

        this.settingSubscription = this.settingsProvider.settings.subscribe((settings: ISettings) => {
            this.settings = settings;
        });

        this.id = this.params.get('id');

        this.trackProvider.resource = `device/${this.id}/tracks`;

        async.series([(callback) => {

            this.storage.get(DATE_SETTINGS_STORAGE_KEY).then((dateSettings?: IDateSettings) => {

                if (dateSettings) {

                    this.dateSettings = dateSettings;

                    if (this.dateSettings.type !== 'custom') {

                        const updatedDateRange = DateSettingsPage.getDateRange(this.dateSettings.value);

                        if (updatedDateRange) {
                            this.dateSettings.startDate = updatedDateRange.startDate;
                            this.dateSettings.endDate = updatedDateRange.endDate;
                        }
                    }
                }

                callback();

            }).catch((err) => {
                callback(err);
            });

        }, (callback) => {

            this.settingsProvider.settings.take(1).subscribe((settings: ISettings) => {
                this.settings = settings;

                this.settings.lastOpenedDeviceId = this.id;
                this.settingsProvider.saveSettings(this.settings);

                callback();
            });

        }, (callback) => {

            this.fetchDeviceInfo();

            this.storage.get(`show-telemetry-${this.id}`).then((showDeviceTelemetry) => {

                this.ngZone.run(() => {
                    this.showTelemetryModel = !!showDeviceTelemetry;
                });

            }).catch((err) => console.log(err));

            this.storage.get(`show-debug-information-${this.id}`).then((showDebugInformation) => {

                this.ngZone.run(() => {
                    this.showDebugInformationModel = !!showDebugInformation;
                });

            }).catch((err) => console.log(err));

            if (this.isGps) {
                this.deviceLocationSubscription = this.apiProvider.deviceLocation.subscribe((deviceLocation: IDeviceLocation) => {

                    if (deviceLocation.id !== this.id) return;
                    if (!this.device) return; // Device is not loaded yet

                    this.previousTrack = this.device.lastTrack;

                    this.device.lastTrack = deviceLocation.lastTrack;

                    if (!this.mapRecenterPaused) {

                        this.mapCenter = deviceLocation.lastLocation.location.coordinates;

                        if (this.map) {

                            this.leafletRecenter = true;

                            this.setDeviceMarker();

                            this.map.setView(L.latLng({ lat: this.mapCenter[1], lng: this.mapCenter[0] }), this.mapZoom);

                            setTimeout(() => {
                                this.leafletRecenter = false;
                            }, 1000);
                        }
                    }

                    this.shownTrack = deviceLocation.lastTrack;

                    this.checkForFirmwareUpdate();

                    if (this.previousTrack && this.device.lastTrack) {

                        if (this.previousTrack.createdAt !== this.device.lastTrack.createdAt) {

                            if (this.settings && this.settings.newTrackRingtone) {

                                this.ringtones.playRingtone(this.settings.newTrackRingtone.Url).catch((err) => {
                                    this.logger.error(err);
                                });
                            }
                        }
                    }

                    setTimeout(() => { // wait for map recenter is done
                        this.fetchTracksByBoundsArea();
                    }, 2000);
                });

                this.activeThemeSubscription = this.settingsProvider.getActiveTheme().subscribe((activeTheme: string) => {

                    if (this.activeTheme && this.activeTheme !== activeTheme) {

                        this.activeTheme = activeTheme;

                        if (this.isNightTheme) {

                            this.roadMutant.removeFrom(this.map);
                            this.nightMutant.addTo(this.map);

                        } else {

                            this.nightMutant.removeFrom(this.map);
                            this.roadMutant.addTo(this.map);
                        }

                        this.fetchTracksByBoundsArea();
                    }
                });
            }

            callback();

        }], (err) => {
            if (err) this.logger.error(err);
        });

        this.userSubscription = this.apiProvider.user.subscribe((user: IUserInfo) => {

            if (user && user.timeZone) {

                this.timeZone = user.timeZone;
            }
        });

        this.firstAlertSubscription = this.apiProvider.firstAlert
            .pipe(
                debounceTime(500),
                filter((el) => el.deviceId === this.id)
            )
            .subscribe((res) => this.fetchDeviceInfo());
    }

    public ngOnDestroy() {

        if (this.watchPositionSubscription) {
            this.watchPositionSubscription.unsubscribe();
        }

        if (this.deviceLocationSubscription) {
            this.deviceLocationSubscription.unsubscribe();
        }

        this.userSubscription.unsubscribe();
        this.firstAlertSubscription.unsubscribe();
        this.settingSubscription.unsubscribe();
    }

    public goEditDevicePage() {

        this.navCtrl.push(EditDevicePage, { id: this.id });
    }

    public goDeviceRulesPage() {

        this.navCtrl.push(RulesPage, { device: this.device });
    }

    public goDeviceMeasurementsPage() {
        this.navCtrl.push(MeasurementsPage, { device: this.device });
    }

    public goDeviceTracksPage() {

        this.navCtrl.push(DeviceTracksPage, { device: this.device });
    }

    public goDeviceChartsPage() {
        this.navCtrl.push(this.isGps ? DeviceGPSChartsPage : DeviceTHSChartsPage, { device: this.device });
    }

    public openDeviceTrackingOptionsModal() {

        this.navCtrl.push(TrackingOptionsPage, { id: this.id, pushed: true });
    }

    public openDeviceSharingPage() {

        this.navCtrl.push(DeviceSharePage, { device: this.device });
    }

    public mapBoundsChange() {

        const $this = this;

        function calculateExtendedBounds() {

            let viewBounds = $this.map.getBounds();

            // Pad map to cover larger area than viewport
            // Make bounds scale proportional to zoom level

            if ($this.map._zoom >= 10) {
                viewBounds = viewBounds.pad(1.8);
            }

            if ($this.map._zoom < 10 && $this.map._zoom > 7) {
                viewBounds = viewBounds.pad(0.5);
            }

            if ($this.map._zoom <= 7 && $this.map._zoom >= 5) {
                viewBounds = viewBounds.pad(0.2);
            }

            return viewBounds;
        }

        const viewBounds = calculateExtendedBounds();

        const southWest = viewBounds.getSouthWest();
        const northEast = viewBounds.getNorthEast();

        this.mapBounds = {
            southWest: {
                lat: southWest.lat,
                lng: calculateCoordinateOffset(southWest.lng)
            },
            northEast: {
                lat: northEast.lat,
                lng: calculateCoordinateOffset(northEast.lng)
            }
        };

        function calculateCoordinateOffset(rawLong) {

            const long = Number(rawLong);

            // No offset needed
            if (long >= -180 && long <= 180) {
                return long;
            }

            // Calculate offset
            if (long > 0) {
                return ((long + 180) % 360) - 180;
            } else {
                return ((long + 180) % 360) + 180;
            }
        }

        this.fetchTracksByBoundsArea();

        // Save zoom value
        this.storeZoomSettings();
    }

    public resumeMapRecenter() {

        this.resumeRecenterControlText.style.opacity = '0';
        this.mapRecenterPaused = false;
    }

    public mapReady() {

        const $this = this;

        (L.Control as any).ResumeButton = L.Control.extend({
            onAdd: (map) => {

                const resumeRecenterControlText = L.DomUtil.create('div');

                $this.resumeRecenterControlText = resumeRecenterControlText;

                resumeRecenterControlText.style.color = '#222';
                resumeRecenterControlText.style['background-color'] = '#ffd76e';
                resumeRecenterControlText.style['border-radius'] = '4px 4px 4px 4px';
                resumeRecenterControlText.style.padding = '3px 5px 3px 5px';
                resumeRecenterControlText.style.cursor = 'pointer';
                resumeRecenterControlText.style.fontSize = '14px';
                resumeRecenterControlText.style.opacity = '0';
                resumeRecenterControlText.innerHTML = 'resume map refresh';

                resumeRecenterControlText.addEventListener('click', () => {

                    $this.resumeMapRecenter();

                    setTimeout(() => {
                        this.fetchDeviceInfo();
                    }, 100);
                });

                return resumeRecenterControlText;
            },
            onRemove: (map) => {

                // Nothing to do here
            }
        });

        (L.control as any).resumeButton = (opts) => {
            return new (L.Control as any).ResumeButton(opts);
        };

        (L.control as any).resumeButton({ position: 'bottomleft' }).addTo(this.map);

        this.map.on('moveend', () => {

            if (!this.leafletRecenter) {

                this.mapBoundsChange();

                this.resumeRecenterControlText.style.opacity = '1';
                this.mapRecenterPaused = true;
            }
        });

        // this.markersLayer = (L as any).canvasIconLayer({}).addTo(this.map);

        // this.storage.get(`map-fullscreen-${this.id}`).then((fullScreen) => {
        //     if (fullScreen) {
        //         setTimeout(() => {
        //             this.map.toggleFullscreen();
        //         }, 100);
        //     }
        // }).catch((err) => {
        //     this.logger.error(err);
        // });
    }

    public changeStatusCode() {

        if (this.device.sharedAccess) return;

        this.actionSheetCtrl.create({
            title: `Set Device mode`,
            buttons: [{
                text: 'WiFi Tracking (Default)',
                handler: () => {
                    this.setStatusCode(1);
                }
            }, {
                text: 'GPS Tracking',
                handler: () => {
                    this.setStatusCode(5);
                }
            }, {
                text: 'GPS Logging',
                handler: () => {
                    this.setStatusCode(4);
                }
            }, {
                text: 'Cancel',
                role: 'cancel',
                cssClass: 'cancel-button'
            }]
        }).present();
    }

    public showDatesHelp() {

        const alert = this.alertCtrl.create({
            title: 'Date Range settings',
            message: 'The date range is used to filter tracks and logs on the map.',
            buttons: ['OK']
        });

        alert.present();
    }

    public showItemHelp(feature, notAllowedForShared = false) {

        if (notAllowedForShared) return;

        this.modalCtrl.create(HelpModal, { feature }).present();
    }

    public openLatestVersionPage() {

        this.navCtrl.push(LatestVersionPage, { firmwareUpdateInfo: this.firmwareUpdateInfo });
    }

    public presentDateSettings() {

        this.modalCtrl.create(DateSettingsPage, {
            dateSettings: Object.assign({}, this.dateSettings),
            callback: (dateSettings: IDateSettings) => {

                this.dateSettings = dateSettings;

                this.storage.set(DATE_SETTINGS_STORAGE_KEY, dateSettings).catch((err) => {
                    this.logger.error(err);
                });

                this.fetchTracksByBoundsArea();
            }
        }).present();
    }

    public isNumber(val) {

        return typeof val === 'number';
    }

    public isNumeric(val) {

        return /^\d+$/.test(val);
    }

    private checkForFirmwareUpdate() {

        if (this.firmwareUpdateInfo) return;
        if (!this.device.firmware) return;

        this.apiProvider.checkForFirmwareUpdate(this.device.firmware).then((firmwareUpdateInfo: IFirmwareUpdateInfo) => {

            this.firmwareUpdateInfo = firmwareUpdateInfo;
        });
    }

    private setDeviceMarker() {

        if (this.deviceMarker) {

            this.deviceMarker.remove();
        }

        if (this.device.lastTrack && this.device.lastTrack.source === trackSources.TRACK_SOURCE_HOME_WIFI_GPS_LOG) {

            // Don't show the Current Location marker when GPS logs present Source:10

            return;
        }

        let icon;
        let rotationAngle = 0;

        const color = UtilsService.getPointColor(this.mapCenter);

        if (this.device.lastTrack && typeof this.device.lastTrack.direction === 'number') {

            let iconPath;

            if (color === 'blue') {

                // Statement: Track with a long number have no direction (even if is reported)
                // It this should be a blue circle since it is a long number of lat/lon

                // iconPath = 'assets/img/gps-direction-blue.png';

            } else {

                rotationAngle = this.device.lastTrack.direction;

                iconPath = 'assets/img/gps-direction-red.png';
            }

            if (iconPath) {

                icon = new L.Icon({
                    iconUrl: iconPath,
                    iconSize: [24, 32],
                    iconAnchor: [12, 31]
                });
            }

        } else {

            const iconUrl = `assets/img/leaflet-color-markers/marker-icon-2x-${color}.png`;

            icon = new L.Icon({
                iconUrl,
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            });
        }

        const options: any = {
            title: this.device.name
        };

        if (icon) options.icon = icon;
        if (rotationAngle) options.rotationAngle = rotationAngle;

        this.deviceMarker = L.marker(L.latLng({ lat: this.mapCenter[1], lng: this.mapCenter[0] }), options);

        this.deviceMarker.addTo(this.map);
    }

    private loadMap() {

        if (this.mapLoaded) return;

        if (!document.getElementById('map')) {

            return;
        }

        this.mapLoaded = true;

        this.map = L.map('map', {
            fullscreenControl: true
        } as L.MapOptions).on('load', () => {

            setTimeout(() => {
                this.mapReady();
                this.mapBoundsChange();
            }, 100);

        }).setView([0, 0], 0);

        this.roadMutant = (L.gridLayer as any).googleMutant({
            maxZoom: 24,
            type: 'roadmap'
        });

        const terrainMutant = (L.gridLayer as any).googleMutant({
            maxZoom: 24,
            type: 'terrain'
        });

        const hybridMutant = (L.gridLayer as any).googleMutant({
            maxZoom: 24,
            type: 'hybrid'
        });

        this.nightMutant = (L.gridLayer as any).googleMutant({
            maxZoom: 24,
            type: 'roadmap',
            styles: [{ elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
            { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
            {
                featureType: 'administrative.locality',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#d59563' }]
            },
            {
                featureType: 'poi',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#d59563' }]
            },
            {
                featureType: 'poi.park',
                elementType: 'geometry',
                stylers: [{ color: '#263c3f' }]
            },
            {
                featureType: 'poi.park',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#6b9a76' }]
            },
            {
                featureType: 'road',
                elementType: 'geometry',
                stylers: [{ color: '#38414e' }]
            },
            {
                featureType: 'road',
                elementType: 'geometry.stroke',
                stylers: [{ color: '#212a37' }]
            },
            {
                featureType: 'road',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#9ca5b3' }]
            },
            {
                featureType: 'road.highway',
                elementType: 'geometry',
                stylers: [{ color: '#746855' }]
            },
            {
                featureType: 'road.highway',
                elementType: 'geometry.stroke',
                stylers: [{ color: '#1f2835' }]
            },
            {
                featureType: 'road.highway',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#f3d19c' }]
            },
            {
                featureType: 'transit',
                elementType: 'geometry',
                stylers: [{ color: '#2f3948' }]
            },
            {
                featureType: 'transit.station',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#d59563' }]
            },
            {
                featureType: 'water',
                elementType: 'geometry',
                stylers: [{ color: '#17263c' }]
            },
            {
                featureType: 'water',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#515c6d' }]
            },
            {
                featureType: 'water',
                elementType: 'labels.text.stroke',
                stylers: [{ color: '#17263c' }]
            }]
        });

        this.settingsProvider.getActiveTheme().take(1).subscribe((theme: string) => {

            this.activeTheme = theme;

            if (this.isNightTheme) {

                this.currentBaseLayer = this.nightMutant.addTo(this.map);

            } else {

                this.currentBaseLayer = this.roadMutant.addTo(this.map);
            }
        });

        // const trafficMutant = (L.gridLayer as any).googleMutant({
        //     maxZoom: 24,
        //     type: 'roadmap'
        // });
        // trafficMutant.addGoogleLayer('TrafficLayer');

        // const transitMutant = (L.gridLayer as any).googleMutant({
        //     maxZoom: 24,
        //     type: 'roadmap'
        // });
        // transitMutant.addGoogleLayer('TransitLayer');

        L.control.layers({
            Roadmap: this.roadMutant,
            Terrain: terrainMutant,
            Hybrid: hybridMutant,
            Night: this.nightMutant
        }, {}, {
            collapsed: true
        }).addTo(this.map);

        this.noMapMessage = null;

        if (this.mapCenter) {

            this.map.setView(L.latLng({ lat: this.mapCenter[1], lng: this.mapCenter[0] }), this.mapZoom);
        }

        this.setDeviceMarker();

        if (this.platform.is('cordova')) {

            const showMyLocationControl = L.Control.extend({
                options: {
                    position: 'bottomright'
                },
                onAdd: (map) => {
                    const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');

                    container.style.backgroundColor = 'white';
                    container.style.backgroundImage = 'url(assets/img/location-icon.svg)';
                    container.style['background-size'] = '25px 25px';
                    container.style['background-position'] = 'center center';
                    container.style.width = '30px';
                    container.style.height = '30px';

                    container.onclick = () => {

                        if (this.currentUserPosition) {

                            this.map.setView(this.currentUserPosition, this.mapZoom);
                        }
                    };

                    return container;
                }
            });

            this.map.addControl(new showMyLocationControl());

            this.watchPositionSubscription = this.geolocation.watchPosition().subscribe((data: Geoposition) => {

                this.onUserLocationChanged(data);
            });
        }

        this.map.on('fullscreenchange', () => {

            this.leafletRecenter = true;

            setTimeout(() => {
                this.leafletRecenter = false;
            }, 1000);

            // this.storage.set(`map-fullscreen-${this.id}`, this.map.isFullscreen()).catch((err) => {
            //     this.logger.error(err);
            // });

            if (this.map.isFullscreen()) {

                if (this.isNightTheme) {

                    setTimeout(() => {
                        this.currentBaseLayer.remove();
                        this.nightMutant.addTo(this.map);
                    }, 500);

                } else {

                    setTimeout(() => {
                        this.currentBaseLayer.remove();
                        this.roadMutant.addTo(this.map);
                    }, 500);
                }

                setTimeout(() => {

                    this.mapBoundsChange();

                }, 1000);
            }

            if (this.platform.is('ios')) {

                this.ngZone.run(() => {

                    if (this.map.isFullscreen()) {

                        this.mapPaddingiOS = true;

                    } else {

                        this.mapPaddingiOS = false;
                    }

                    // console.log(`mapPaddingiOS: ${this.mapPaddingiOS}`);
                });
            }

            setTimeout(() => {
                this.resumeMapRecenter();
            }, 200);
        });
    }

    private fetchDeviceInfo() {

        this.deviceProvider.getItem(this.id).then((device: IDevice) => {
            this.device = device;
            this.firstAlert = device.firstAlert;

            if (this.isGps) {
                this.noMapMessage = null;

                if (this.device) {
                    this.previousTrack = this.device.lastTrack;
                }

                if (!this.device.lastTrack) {

                    this.noMapMessage = 'No Device location history available.';

                    setTimeout(this.loadMap.bind(this), 100);

                } else if (this.device.lastTrack.location && this.device.lastTrack.location.coordinates[0] !== 0) {

                    if (!this.mapRecenterPaused) {

                        this.mapCenter = this.device.lastTrack.location.coordinates;

                        setTimeout(this.loadMap.bind(this), 100);

                        if (this.map) {

                            this.leafletRecenter = true;

                            this.setDeviceMarker();

                            this.map.setView(L.latLng({ lat: this.mapCenter[1], lng: this.mapCenter[0] }), this.mapZoom);

                            setTimeout(() => {
                                this.leafletRecenter = false;
                            }, 1000);
                        }
                    }

                } else {

                    if (!this.mapRecenterPaused) {

                        // Fetch last non-zero coordinates and set map center
                        this.deviceProvider.getLastLocation(this.id).then((lastLocation: ITrack) => {

                            this.mapCenter = lastLocation.location.coordinates;

                            setTimeout(this.loadMap.bind(this), 100);

                            if (this.map) {

                                this.leafletRecenter = true;

                                this.setDeviceMarker();

                                this.map.setView(L.latLng({ lat: this.mapCenter[1], lng: this.mapCenter[0] }), this.mapZoom);

                                setTimeout(() => {
                                    this.leafletRecenter = false;
                                }, 1000);
                            }
                        });
                    }
                }

                this.shownTrack = this.device.lastTrack;

                this.device.trackingOptions.notifications = this.device.trackingOptions.notifications.map((notificationData) => {

                    return NotificationFactory.createNotification(notificationData);
                });

                this.checkForFirmwareUpdate();

                if (this.previousTrack && this.device.lastTrack) {

                    if (this.previousTrack.createdAt !== this.device.lastTrack.createdAt) {

                        if (this.settings && this.settings.newTrackRingtone) {

                            this.ringtones.playRingtone(this.settings.newTrackRingtone.Url).catch((err) => {
                                this.logger.error(err);
                            });
                        }
                    }
                }
            }

        }).catch((err) => {
            console.log(err);
        });
    }

    private fetchTracksByBoundsArea() {

        const clusterizeMinLimit = 50;

        let startDate;
        let endDate;

        if (this.dateSettings.startDate && moment(this.dateSettings.startDate).isValid()) {

            startDate = this.dateSettings.startDate;

        } else {

            startDate = moment().subtract(1, 'day');
        }

        if (this.dateSettings.endDate && moment(this.dateSettings.endDate).isValid()) {

            endDate = this.dateSettings.endDate;

        } else {

            endDate = moment();
        }

        this.loadPoints({
            startDate,
            endDate,
            clusterizeMinLimit
        });
    }

    private loadPoints(options) {

        // console.log(`loadPoints`);

        this.trackProvider.getListForMap(this.id, {
            filter: {
                startDate: encodeURIComponent(momentTimezone(options.startDate).tz(this.timeZone).startOf('day').format()),
                endDate: encodeURIComponent(momentTimezone(options.endDate).tz(this.timeZone).endOf('day').format()),
                showGPSLogs: this.showGPSLogs
            },
            mapBounds: this.mapBounds,
            zoom: this.map.getZoom(),
            clusterize: this.settings.clusterizeDeviceMap,
            clusterizeMinLimit: options.clusterizeMinLimit
        }).then((data: any) => {

            if (this.markers) {

                this.markers.remove();

                this.markers = null;
            }

            if (data.clusterized) {

                this.markers = (L as any).markerClusterGroup({
                    chunkedLoading: true,
                    singleMarkerMode: true,
                    zoomToBoundsOnClick: true,
                    iconCreateFunction: (cluster) => {

                        let count = 0;
                        let children;

                        if (cluster.getAllChildMarkers) {

                            children = cluster.getAllChildMarkers();

                            for (const child of children) {

                                if (child.feature.properties.count) {

                                    count += child.feature.properties.count;

                                } else {

                                    count++;
                                }
                            }
                        }

                        if (count === 1) {

                            const color = UtilsService.getPointColor(children[0].feature.geometry.coordinates);

                            let iconPath;

                            if (color === 'blue') {

                                if (this.isNightTheme) {

                                    iconPath = 'assets/img/circle-green.png';

                                } else {

                                    iconPath = 'assets/img/circle-blue.png';
                                }

                            } else {

                                if (this.isNightTheme) {

                                    iconPath = 'assets/img/circle-orange.png';

                                } else {

                                    iconPath = 'assets/img/circle-red.png';
                                }
                            }

                            return L.icon({
                                iconUrl: iconPath
                                // iconSize: [38, 38],
                                // iconAnchor: [22, 94],
                                // popupAnchor: [-3, -76],
                                // shadowUrl: 'my-icon-shadow.png',
                                // shadowSize: [68, 95],
                                // shadowAnchor: [22, 94]
                            });
                        }

                        let c = ' marker-cluster-';

                        if (count < 10) {
                            c += 'small';
                        } else if (count < 100) {
                            c += 'medium';
                        } else {
                            c += 'large';
                        }

                        return new L.DivIcon({
                            html: '<div><span>' + count + '</span></div>',
                            className: 'marker-cluster' + c,
                            iconSize: new L.Point(40, 40)
                        });
                    }
                });

                this.markers.on('clusterclick', (a) => {
                    a.layer.zoomToBounds({ padding: [20, 20] });
                });

                this.markers.on('click', (event) => {

                    if (event.layer.feature.properties.data && event.layer.feature.properties.data.id) {

                        this.onMarkerClick(
                            event.layer.feature.properties.data,
                            event.layer.feature.geometry.coordinates
                        );
                    }
                });

                const geoJsonLayer = L.geoJSON(data.geoJSON);

                this.markers.addLayer(geoJsonLayer);

                this.markers.addTo(this.map);

            } else {

                if (data.geoJSON.features.length > 500) {

                    this.markers = L.layerGroup(this.prepareMarkersOnCanvas(data));

                } else {

                    this.markers = L.layerGroup(this.prepareMarkers(data));
                }
            }

            // console.time(`addToMap(points: ${data.geoJSON.features.length})`);

            this.markers.addTo(this.map);

            // console.timeEnd(`addToMap(points: ${data.geoJSON.features.length})`);
        });
    }

    private prepareMarkers(data) {

        // console.time(`prepareMarkers(points: ${data.geoJSON.features.length})`);

        const markers = data.geoJSON.features.map((feature) => {

            const color = UtilsService.getPointColor(feature.geometry.coordinates);

            let iconUrl;
            let iconSize;
            let iconAnchor;

            if (feature.properties.data.source === trackSources.TRACK_SOURCE_HOME_WIFI) {

                iconUrl = 'assets/img/circle-bright-green.png';

                iconSize = [10, 10];
                iconAnchor = [5, 5];

            } else if (feature.properties.data.source === trackSources.TRACK_SOURCE_HOME_WIFI_GPS_LOG) {

                if (this.isNightTheme) {

                    if (typeof feature.properties.data.direction === 'number') {

                        iconUrl = 'assets/img/circle-white-with-direction.png';

                        iconSize = [12, 12];
                        iconAnchor = [5, 5];

                    } else {

                        iconUrl = 'assets/img/circle-white.png';

                        iconSize = [10, 10];
                        iconAnchor = [5, 5];
                    }

                } else {

                    if (typeof feature.properties.data.direction === 'number') {

                        iconUrl = 'assets/img/circle-black-with-direction.png';

                        iconSize = [12, 12];
                        iconAnchor = [5, 5];

                    } else {

                        iconUrl = 'assets/img/circle-black.png';

                        iconSize = [10, 10];
                        iconAnchor = [5, 5];
                    }
                }

            } else if (color === 'blue') {

                if (this.isNightTheme) {

                    iconUrl = 'assets/img/circle-green.png';

                } else {

                    iconUrl = 'assets/img/circle-blue.png';
                }

                iconSize = [10, 10];
                iconAnchor = [5, 5];

            } else {

                if (typeof feature.properties.data.direction === 'number') {

                    if (this.isNightTheme) {

                        iconUrl = 'assets/img/circle-orange-v1.png';

                    } else {

                        iconUrl = 'assets/img/circle-red-v1.png';
                    }

                    iconSize = [12, 12];
                    iconAnchor = [5, 5];

                } else {

                    if (this.isNightTheme) {

                        iconUrl = 'assets/img/circle-orange.png';

                    } else {

                        iconUrl = 'assets/img/circle-red.png';
                    }

                    iconSize = [10, 10];
                    iconAnchor = [5, 5];
                }
            }

            const marker = L.marker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
                icon: L.icon({
                    iconUrl,
                    iconSize,
                    iconAnchor
                }),
                rotationAngle: feature.properties.data.direction || 0
            } as any);

            marker.on('click', () => {

                this.onMarkerClick(feature.properties.data, feature.geometry.coordinates);
            });

            return marker;
        });

        // console.timeEnd(`prepareMarkers(points: ${data.geoJSON.features.length})`);

        return markers;
    }

    private prepareMarkersOnCanvas(data) {

        const markers = [];

        const renderer = L.canvas();

        const MARKER_COLOR_BLUE = '#0000ff';
        const MARKER_COLOR_ORANGE = '#ffd700';
        const MARKER_COLOR_RED = '#ff0000';
        const MARKER_COLOR_GREEN = '#00ff1a';
        const MARKER_COLOR_BRIGHT_GREEN = '#7fd228';
        const MARKER_COLOR_WHITE = '#ffffff';
        const MARKER_COLOR_BLACK = '#000000';

        // console.time(`prepareMarkersOnCanvas(points: ${data.geoJSON.features.length})`);

        data.geoJSON.features.forEach((feature) => {

            let color;

            if (feature.properties.data.source === trackSources.TRACK_SOURCE_HOME_WIFI) {

                color = MARKER_COLOR_BRIGHT_GREEN;

            } else if (feature.properties.data.source === trackSources.TRACK_SOURCE_HOME_WIFI_GPS_LOG) {

                if (this.isNightTheme) {

                    color = MARKER_COLOR_WHITE;

                } else {

                    color = MARKER_COLOR_BLACK;
                }

            } else {

                const pointColor = UtilsService.getPointColor(feature.geometry.coordinates);

                if (pointColor === 'blue') {

                    if (this.isNightTheme) {

                        color = MARKER_COLOR_GREEN;

                    } else {

                        color = MARKER_COLOR_BLUE;
                    }

                } else {

                    if (this.isNightTheme) {

                        color = MARKER_COLOR_ORANGE;

                    } else {

                        color = MARKER_COLOR_RED;
                    }
                }
            }

            const marker = L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
                renderer,
                radius: 4,
                weight: 1,
                color,
                opacity: 0.7,
                fill: false
            });

            marker.on('click', () => {

                this.onMarkerClick(feature.properties.data, feature.geometry.coordinates);
            });

            markers.push(marker);
        });

        // console.timeEnd(`prepareMarkersOnCanvas(points: ${data.geoJSON.features.length})`);

        return markers;
    }

    private onUserLocationChanged(data: Geoposition) {

        if (!data) {

            this.logger.error(`DevicePage::onUserLocationChanged: No data provided`);

            return;
        }

        if (!data.coords) {

            this.logger.error(data);

            return;
        }

        // console.log(data);

        this.geoPositionData = data;

        if (!this.map) {

            this.logger.debug(`DevicePage::onUserLocationChanged: Map is not initialized`);

            return;
        }

        if (this.currentUserPositionMarker) {

            this.map.removeLayer(this.currentUserPositionMarker);
            this.map.removeLayer(this.currentUserAccuracyMarker);
        }

        const radius = Math.floor(data.coords.accuracy / 2);

        this.currentUserPosition = L.latLng({ lat: data.coords.latitude, lng: data.coords.longitude });

        const greyIcon = new L.Icon({
            iconUrl: 'assets/img/leaflet-color-markers/marker-icon-2x-grey.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });

        this.currentUserPositionMarker = L.marker(this.currentUserPosition, { icon: greyIcon }).addTo(this.map)
            .bindPopup(`You are within ${radius} meters from this point`);

        this.currentUserAccuracyMarker = L.circle(this.currentUserPosition).addTo(this.map);
    }

    private setStatusCode(code) {

        const loader = this.loadingCtrl.create({
            content: `Changing status`
        });

        this.deviceProvider.setStatusCode(this.device, code).then(() => {
            loader.dismiss();
            this.ngZone.run(() => {
                this.device.code.value = code;
            });
        }).catch(() => {
            loader.dismiss();
        });
    }

    private storeZoomSettings() {

        localStorage.setItem(this.deviceMapZoomKey, this.map.getZoom().toString());
    }

    private onMarkerClick(t, coordinates) {

        this.setCurrentTrackMarker(t.source, {
            lat: coordinates[1],
            lng: coordinates[0]
        });

        this.trackProvider.getTrack(this.device.id, t.id).then((track: ITrack) => {

            this.shownTrack = track;
        });
    }

    private setCurrentTrackMarker(source: number, latLng: any) {

        if (this.currentTrackMarker) {

            this.currentTrackMarker.remove();
        }

        if (this.deviceMarker) { // Remove device marker

            this.deviceMarker.remove();
        }

        const blackIcon = new L.Icon({
            iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-black.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });

        const greenIcon = new L.Icon({
            iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });

        const options: any = {};

        if (source === 10) {

            options.icon = blackIcon;

        } else if (source === 8) {

            options.icon = greenIcon;
        }

        this.currentTrackMarker = L.marker(L.latLng({
            lat: latLng.lat,
            lng: latLng.lng
        }), options);

        this.currentTrackMarker.addTo(this.map);
    }

    /**
     * Dismiss first alert by ID
     * @param id - device id
     */
    public dismissAlert() {
        this.deviceProvider.dismissFirstAlerts(this.id);
    }
}
