// This section sets up some basic app metadata,
// the entire section is optional.
App.info({
    id: 'com.exentriq.edo',
    version: '1.1.3',
    name: 'ExentriqEDO',
    description: 'ExentriqEDO',
    author: 'Exentriq Ltd.',
    email: 'support@exentriq.com',
    website: 'http://www.exentriq.com'
});

// Set up resources such as icons and launch screens.
App.icons({
    iphone   : 'public/img/logo/ios/app-icon-iphone@1x.png',
    iphone_2x: 'public/img/logo/ios/app-icon-iphone@2x.png',
    iphone_3x: 'public/img/logo/ios/app-icon-iphone@3x.png',

    android_ldpi : 'public/img/logo/android/ic_launcher_ldpi.png',
    android_mdpi : 'public/img/logo/android/ic_launcher_mdpi.png',
    android_hdpi : 'public/img/logo/android/ic_launcher_hdpi.png',
    android_xhdpi: 'public/img/logo/android/ic_launcher_xhdpi.png'
});

App.launchScreens({
    iphone            : 'private/splash/ios/iphone.png',
    iphone_2x         : 'private/splash/ios/iphone@2x.png',
    iphone5           : 'private/splash/ios/iphone5.png',
    iphone6           : 'private/splash/ios/iphone6.png',
    iphone6p_portrait : 'private/splash/ios/iphone6p_portrait.png',

    android_ldpi_portrait  : 'private/splash/android/android-port-ldpi.png',
    android_mdpi_portrait  : 'private/splash/android/android-port-mdpi.png',
    android_hdpi_portrait  : 'private/splash/android/android-port-hdpi.png',
    android_xhdpi_portrait : 'private/splash/android/android-port-xhdpi.png'
});

// Set PhoneGap/Cordova preferences
//App.setPreference('xwalkCommandLine','--disable-gesture-requirement-for-media-playback');

// Common
App.setPreference('Orientation', 'portrait');
App.setPreference('HideKeyboardFormAccessoryBar', true);
App.setPreference('KeyboardDisplayRequiresUserAction', false);
App.setPreference('StatusBarOverlaysWebView', false);
App.setPreference('StatusBarStyle', 'lightcontent');
App.setPreference('StatusBarBackgroundColor', '#1bbc9b');
App.setPreference('ShowSplashScreenSpinner', false);
App.setPreference('ENABLE_BITCODE', false);

// iOS
App.setPreference('target-device', 'handset');
App.setPreference('deployment-target', '8.0');

// Android
App.setPreference('android-targetSdkVersion', '19');
App.setPreference('android-minSdkVersion', '15');

// Access Rules
App.accessRule('file:*');
App.accessRule('blob:*');
App.accessRule('cdv:*');
App.accessRule('gap:*');
App.accessRule('*');

// Pass preferences for a particular PhoneGap/Cordova plugin
/*App.configurePlugin('com.phonegap.plugins.facebookconnect', {
    APP_NAME: 'ExentriqTalk',
    APP_ID: '835103589938459'
});*/