## [1.22.6] (2019-11-03)

* **Search** Sticky and light search field

## [1.22.4] (2019-10-20)

* **First Alert:** Handle PUSH notifications

## [1.22.3] (2019-10-13)

* **First Alert:** Feature implementation

## [1.22.2] (2019-09-29)

* **API:** Fix: Getting an error in the mobile app

## [1.22.1] (2019-07-05)

* **UX:** UX improvements

## [1.22.0] (2019-06-28)

* **Rule:**: Added a rule for Reefer Hours

## [1.21.10] (2019-06-14)

* **Charts** Improve Volts chart for Cable Kit connected devices

## [1.21.9] (2019-06-10)

* **Trakkit** Fix sharing button

## [1.21.7] (2019-05-25)

* **Trakkit** Added Trakkit config page

## [1.21.5] (2019-05-22)

* **Help** Fix iOS YouTube player issue
* **Search** Fix keyboard issue on search dismiss

## [1.21.4] (2019-05-17)

* **Alerts**: Merge Alerts and Notifications

## [1.21.2] (2019-05-17)

* **Help**: Update "Help" page, added "Add Your Trakkit to Your Account" button.

## [1.21.1] (2019-05-02)

* **Sharing:**: Disable share button for shared devices.
* **Devices:**: Change to "New device" to "Add New Device".
* **General:**: Added "Instruction Page".

## [1.21.0] (2019-04-13)

* **Alerts:**: Alerts for GPS Logs

## [1.20.5] (2019-03-30)

* **Custom:**: Added `gy1` tracks handling

## [1.20.3] (2019-03-10)

* **Device:**: Fix "Rules" button
* **Help:**: Hints improvements

## [1.20.2] (2019-03-09)

* **Device:**: Updated Device page UX
* **Device:**: Remove "Show Map" toggle button
* **Device:**: Added color circles for Device Tracking Mode

## [1.19.5] (2019-02-21)

* **Charts:**: Improve Charts for devices connected with Cable Kit

## [1.19.4] (2019-02-09)

* **Core:**: Use unofficial "cordova-plugin-uniquedeviceid" plugin by massaroni

## [1.19.1] (2019-02-08)

* **Core:**: Fix an issue with devices list auto update after platform suspend and resume

## [1.19.0] (2019-02-08)

* **Rule:**: Added a rule for speed

## [1.18.2] (2018-12-14)

* **PUSH:** Update APN certificate
* **Devices:** Hide keyboard on search clear

## [1.18.0] (2018-12-07)

* **Map:** Added "Show GPS Logs" toggle button
* **Trakkit Mode:** Disable Trakkit Mode button if Cable Kit in use

## [1.17.4] (2018-11-20)

* **Sign Up** Form improvements

## [1.17.1] (2018-08-24)

* **Map:** Show current track on map with black/green/regular teardrop on click
* **Static map:** Update static map, add more colors

## [1.16.9] (2018-08-10)

* **Map:** Improve map performance with Leaflet circle markers
* **Devices:** Improve real-time list update

## [1.16.8] (2018-08-03)

* **Devices:**: Highlight device for "fresh" updates only ( <= 1 sec )
* **Devices:**: Sort devices in a list in a runtime
* **Devices:**: Fix sorting functionality for infinite scroll

## [1.16.4] (2018-07-19)

* **Tracks:**: Sort tracks according to `sortTime`
* **Chart:**: Fix rendering total number os data points

## [1.16.1] (2018-07-18)

* **Chart:**: Show full date in tooltips
* **Tracks:**: Show gpsTime for tracks with source:10
* **Tracks:**: Show direction
* **Account:**: Fix new E-mail address adding error

## [1.15.1] (2018-07-16)

* **Map:**: Fix fullscreen map size
* **Map:**: Do now show current device position for Source: 10

## [1.15.0] (2018-07-11)

* **Date picker:**: Add more quick options

## [1.14.0] (2018-07-09)

* **Core:**: Device sharing

## [1.12.1] (2018-06-19)

* **Map:**: Improve the performance of markets rendering using a single canvas

## [1.12.0] (2018-06-14)

* **Map:**: Added ability to load mat points by buckets
* **Charts:**: Use separate date range picker
* **Account:**: Fix "Remember password" feature

## [1.11.10] (2018-06-05)

* **TrakkitPlugin:**: Added settings button
* **Charts:**: Improve charts

## [1.11.3] (2018-06-04)

* **Charts:**: Improve device charts

## [1.10.8] (2018-05-29)

* **Map:** Show map for devices by default
* **DevicesPage:** Change title "Devices" -> "Trakkit"
* **Settings:** Added "showDeviceDebug" settings
* **TrakkitPlugin:** Dependency update

## [1.10.7] (2018-05-21)

* **TrakkitPlugin:** Dependency update

## [1.10.6] (2018-05-18)

* **TrakkitPlugin:** Dependency update
* **App:** Change logo

## [1.10.3] (2018-03-30)

* **PUSH:** Update UID generation

## [1.10.0] (2018-03-26)

* **Rules:** Fix rule removing
* **Rules:** Added geo-fence "either" operator
* **Rules:** Add more than 10 devices for a rule
* **PUSH:** Show Toast instead of alert if PUSH notification received in a foreground

## [1.8.6] (2018-03-14)

* **Map:** Improve map points

## [1.8.5] (2018-03-06)

* **Core:** Change device status text

## [1.8.2] (2018-02-22)

* **Map:** Added map point for a night mode

## [1.8.1] (2018-02-19)

* **Core:** Disable SignIn/SignUp buttons after first click
* **Core:** Update dependencies

## [1.8.0] (2018-02-06)

* **Rules:** Allow user change "Device" string
* **Core:** Refresh devices page if the app is back in focus
* **Core:** Update dependencies
* **Core:** Fix phantom device update
* **Core:** Fix top menu bar

## [1.7.0] (2018-01-30)

* **Rules:** Ability to limit Alerts in time
* **Rules:** Added "Volt" condition type

## [1.6.1] (2018-01-27)

* **DevicesPage:** Fix device list real-time updates

## [1.6.0] (2018-01-24)

* **Rules:** Added temperature (NTC1) to allowed list of parameters

## [1.5.3] (2018-01-22)

* **DevicesPage:** Fix highlight changes when in night mode.

## [1.5.0] (2018-01-17)

* **Core:** Update dependencies.

## [1.4.6] (2018-01-16)

* **Core:** Use full timestamp for date's filters.

## [1.4.5] (2018-01-16)

* **Map:** Added `clusterizeDeviceMap` setting.
* **Core:** Disable feature with `lastOpenedDeviceId` (disable with a feature flag).

## [1.4.4] (2018-01-16)

* **Map:** Added `getNumberOfDecimalPlaces`, fix error for coordinate without a dot.

## [1.4.3] (2017-11-30)

* **Core:** Update dependencies.

## [1.4.2] (2017-11-01)

* **Map:** Store map zoom settings for devices in a local storage.
* **Map:** Dynamically load new device map points.

## [1.4.0] (2017-10-30)

* **Core:** Change "Cable Kit attached" -> "Cable Kit".
* **Core:** Fix error with Socket.io reconnection.

## [1.3.5] (2017-10-19)

* **DevicesPage:** Highlight for a few seconds when that device gets new data.
* **DevicesPage:** Device page reload by Socket.io

## [1.3.3] (2017-10-12)

* **DateRangePicker:** Use mobile device timezone for date range picker.
* **Map:** Show red dots direction.
* **Map:** Fix red/blue dots position on a map.

## [1.3.1] (2017-10-04)

* **Map:** Apply statement. Track with a long number have no direction (even if is reported). 
           It this should be a blue circle since it is a long number of lat/lon.

* **Core:** Update dependencies.

## [1.2.4] (2017-09-25)

### Changes

* **DevicePage:** Added new fields: `ntc1`, `ntc2`, `ntc3`, `volts`.
* **TracksPage:** Added new fields: `ntc1`, `ntc2`, `ntc3`, `volts`.
* **TrackPage:** Added new fields: `ntc1`, `ntc2`, `ntc3`, `volts`.

## [1.2.3] (2017-09-15)

### Changes

* **Core:** Suspend Socket.io connection with a server while application in a background.
* **Core:** Reload application if it spent more than 3 hours in a background.
* **Core:** Write application logs to Loggly.

## [1.2.2] (2017-09-14)

### Fixes

* **Core:** Show "Authentication error" if status code is 401.
* **Rules:** Fix phones & emails fetching for Rule editor.
* **GeoZoneCondition:** Use real mobile device location as initial zone center position.

## [1.2.1] (2017-09-05)

### Features

* **TracksPage:** Keep highlighted choice after viewing a TracksPage.

### Changes

* **Core:** Allow undefined values for track location.

## [1.2.0] (2017-09-04)

### Features

* **Rules:** Ability to assign rule to a multiple devices.

### Fixes

* **TracksPage:** Show original data time on track(s) page.
* **TrackPage/DevicesPage:** Correct Google static map URI.
* **AccountPage:** Update phones processing.
* **DateRange:** Update time format.

## [1.1.0] (2017-08-25)

### Fixes

* **SignUp:** Fix typo.

### Features

* **DevicePage:** Replace ttf with direction.
* **DateSettingsPage:** Added advanced date range picker.

## [0.1.13] (2017-08-18)

### Features

* **TrackPage:** Added a static map with location.
* **DevicesPage:** Ability to search by device name, mac and firmware version.
* **DevicesPage:** Ability to sort by device date added, last seen date and firmware version.

### Changes

* **Core:** Proper handling for notifications number badge.

### Fixes

* **Map:** Fix night mode runtime switch.

## [0.1.12] (2017-08-11)

### Changes

* **TimeZonePicker:** Improve timezone picker page.
* **Core:** Pull data from server using websockets.
* **Push:** Fix notifications badge on app icon.
* **Core:** Added app icon.
* **UI:** Night mode for all parts of the app.
* **Map:** Do not clusterize < 50 points.

## [0.1.11] (2017-08-08)

### Changes

* **DevicePage:** Use American date format MM-DD-YYYY (data picker).
* **RingtonPicker:** Added rington picker with sound preview.
* **NewPhonePage:** Added new phone page with country codes.
* **RulesPage:** Ability to remove all Device rules.
* **MotionCondition:** Improve and simplify UI.

## [0.1.10] (2017-08-02)

### Fixes

* **Support** Fix screenshot encoding for Android.

## [0.1.9] (2017-08-02)

### Changes

* **Support** Added ability to attach a screenshot to a ticket. Added OS version reporting.
* **SignInPage:** Change title to "Zedly Trakkit".
* **Core:** Switch API to HTTPS.
* **AlertsPage:** Ability to clear all alerts.
* **NotificationsPage:** Ability to clear all notifications.
* **TrackingOptionPage:** Fix transition bug. Rename: "Track" =\> "Save".

## [0.1.8] (2017-08-01)

### Features

* **Support** Added ability to submit a support ticket.

## [0.1.7] (2017-07-31)

### Features

* **DevicePage** Night map mode.

### Changes

* **Error handling:** Change modal from to toast for connection error.
* **TracksPage:** Change date time format to `M/DD/YYYY, h:mm:ss a`.
* **TracksPage:** Fix layout for small screens.
* **SignInPage:** "Sing In" =\> "Sign In".
* **DevicePage:** "Missed" =\> "Missing".

### Dependencies

* **Core:** Update Ionic to 3.6.0

## [0.1.6] (2017-07-27)

### Changes

* **Core:** Timestamp format changes.

## [0.1.5] (2017-07-27)

### Features

* **DeviceTracksPage:** Added a new page, listing of a device tracks.
* **DeviceTrackPage:** Added a new page, a specific device track.
* **SignInPage:** Added `Remember password` button.
* **Core:** Ability to recover password.
* **Core:** Added sound notifications if new track received.

## [0.1.4] (2017-07-26)

### Changes

* **DevicePage** Fix map markers reloading.
* **DevicePage** Remove Locate, change Missed to Missing (keep Missing code=5), highlight Cancel to standout.
* **DevicePage** Once pushing Resume Map Refresh, it should immediately refresh the map.
* **DevicePage** Change current user location marker color.
* **Core** Store Map refresh interval in settings.
* **Core** Remember last device and open on startup.
* **CheckUpdatePage** Show information about Firmware update.
* **Core** Remember user password as well.

## [0.1.2](https://github.com/bushev/gps-tracker-app/compare/v0.1.1...v0.1.2) (2017-07-17)

### Changes

* **SignInPage** Show the Sign Up button below the Sign In.
* **WelcomeInPage** the App when first Opens, says: 'Sing In' and 'Sign Up'.
* **DevicesPage** On Devices List page, top right, instead of 'New', put 'Add'.
* **DevicesPage** Show current Batt Level, 90%, 80%, or Line to the right of the MAC.
* **App** `gps-tracker-app` -> `Trakkit`.
* **DevicePage** Collapse layers switch.
* **Core** Change FCM keys.
* **Core** Update leaflet version, use npm distribution.

### Features

* **DevicePage:** Ability to collapse the Device Telemetry data.
* **DevicePage:** Show User location on a map.
* **DevicePage:** Add ability to set device status.
