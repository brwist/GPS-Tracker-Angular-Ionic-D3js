#!/bin/sh
# cp platforms/android/google-services.json platforms/android/app/google-services.json
rm -rf platforms/android/app/build/outputs/apk/debug/* && \
    ionic cordova build android --prod && \
    open platforms/android/app/build/outputs/apk/debug


#    zipalign -v 4 platforms/android/app/build/outputs/apk/debug/app-debug.apk \
#        platforms/android/app/build/outputs/apk/debug/Trakkit-1.15.3.apk && \

#    jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -storepass f4UVnvh294nvD \
#        -keystore /Users/bushev/Dropbox/UpWork/gps-tracker/gps-tracker-key.keystore \
#        platforms/android/app/build/outputs/apk/debug/app-debug.apk alias_name && \
