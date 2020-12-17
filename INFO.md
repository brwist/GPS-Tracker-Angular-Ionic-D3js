### iOS build checklist

- Enable PUSH notifications capability
- Run `pod install` in `platforms/ios`
- Set "Show your current position on a map" in plist manually
- Add "NSLocationAlwaysUsageDescription" key to plist manually
- Workspace Settings -> Build System -> Legacy

Open Android SDK Manager
> ~/Library/Android/sdk/tools/android

Open AVD (Devices)
> ~/Library/Android/sdk/tools/android avd

### Build Android

ionic cordova build android --release --prod
ionic cordova build ios --prod
Manually remove "RECORD_AUDIO" permission

## Sign

Generate key:
1. keytool -genkey -v -keystore gps-tracker-key.keystore -alias alias_name -keyalg RSA -keysize 2048 -validity 10000

PASS: f4UVnvh294nvD

2. `jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -storepass f4UVnvh294nvD \
        -keystore /Users/bushev/Dropbox/Freelance/UpWork/gps-tracker/gps-tracker-key.keystore \
        platforms/android/build/outputs/apk/android-release-unsigned.apk alias_name`

3. `zipalign -v 4 platforms/android/build/outputs/apk/android-release-unsigned.apk \
        platforms/android/build/outputs/apk/Trakkit-1.2.3.apk`

## Update Trakkit Cordova Plugin

rm -rf plugins/trakkit-cordova-plugin && rm -rf platforms/android && ./build_android.sh


## How PUSH notifications works

1. If application is not loaded (not running, not in RAM). We will receive PUSH notification in the notification center.
2. If application loaded but not in focus, running in a background. We will receive PUSH in the notification center.
3. If app loaded and running in foreground, in focus. We will receive PUSH but it will not be shown in the notification center (it’s OS limitations). We will show a Toast + Add a red dot near the device in a device list.
