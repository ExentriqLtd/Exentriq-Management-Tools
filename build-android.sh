#!/bin/bash

rm -rf .meteor/local/cordova-build
rm -rf ../app-android-build

echo 'Start build...'
meteor build ../app-android-build --server http://149.202.77.27:5007 --mobile-settings settings.json

echo 'Dispose'
rm -rf ../app-android-build/ios

echo 'Sign the APK'
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 ../app-android-build/android/release-unsigned.apk ExentriqEDO

echo 'Optimize APK'
$ANDROID_HOME/build-tools/23.0.3/zipalign 4 ../app-android-build/android/release-unsigned.apk ExentriqEDO.apk