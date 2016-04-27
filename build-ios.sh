#!/bin/bash

rm -rf .meteor/local/cordova-build
rm -rf ../app-ios-build

echo 'Start build...'
meteor build ../app-ios-build --server http://149.202.77.27:5007 --mobile-settings settings.json

echo 'Dispose'
rm -rf ../app-ios-build/android

echo 'Open project...'
open ../app-ios-build/ios/project/ExentriqEDO.xcodeproj

cp plugins/PushPlugin.h ../app-ios-build/ios/project/ExentriqEDO/Plugins/phonegap-plugin-push/PushPlugin.h
cp plugins/PushPlugin.m ../app-ios-build/ios/project/ExentriqEDO/Plugins/phonegap-plugin-push/PushPlugin.m

echo 'TODO'
echo '- Change provisioning profiles'
echo '- Convert icons and launch images to use Asset Catalog'