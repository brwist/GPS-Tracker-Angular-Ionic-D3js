#!/bin/sh

# rm -rf platforms/android plugins/trakkit-cordova-plugin
# cp platforms/android/google-services.json platforms/android/app/google-services.json

rm -rf platforms/android/build/outputs/apk/* && \
    NODE_OPTIONS=--max_old_space_size=4096 ./node_modules/.bin/ionic cordova build android --release --prod && \
    jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -storepass f4UVnvh294nvD \
        -keystore /Users/rayzik/work/projects/zedly/gps-tracker-key.keystore \
        platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk alias_name && \
    ~/Library/Android/sdk/build-tools/29.0.2/zipalign -v 4 platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk \
        platforms/android/app/build/outputs/apk/release/Trakkit-1.23.0.apk && \
    open platforms/android/app/build/outputs/apk/release

 # -keystore /Users/bushev/Dropbox/UpWork/gps-tracker/gps-tracker-key.keystore \