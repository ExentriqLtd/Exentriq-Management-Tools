#!/bin/bash

rm -rf .meteor/local/cordova-build
rm -rf ../app-ios-build

echo 'Start build...'
meteor build ../app-ios-build --server http://149.202.77.27:5007 --mobile-settings settings.json

echo 'Open project...'
open ../app-ios-build/ios/project/ExentriqNotifications.xcodeproj

echo 'TODO'
echo '- Change provisioning profiles'
echo '- Convert icons and launch images to use Asset Catalog'