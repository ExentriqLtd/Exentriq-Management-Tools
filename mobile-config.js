// This section sets up some basic app metadata,
// the entire section is optional.
App.info({
    id: 'com.exentriq.edo',
    version: '1.0',
    name: 'ExentriqEDO',
    description: 'ExentriqEDO',
    author: 'Exentriq Ltd.',
    email: 'support@exentriq.com',
    website: 'http://www.exentriq.com'
});

// Set up resources such as icons and launch screens.
/*App.icons({
    iphone   : 'public/images/logo/apple-touch-icon-60x60.png',
    iphone_2x: 'public/images/logo/apple-touch-icon-120x120.png',
    iphone_3x: 'public/images/logo/apple-touch-icon-180x180.png',
    ipad     : 'public/images/logo/apple-touch-icon-76x76.png',
    ipad_2x  : 'public/images/logo/apple-touch-icon-152x152.png',

    android_ldpi : 'public/images/logo/android-mdpi.png',
    android_mdpi : 'public/images/logo/android-mdpi.png',
    android_hdpi : 'public/images/logo/android-hdpi.png',
    android_xhdpi: 'public/images/logo/android-xhdpi.png'
});*/

/*App.launchScreens({
    iphone            : 'private/splash/iphone.png',
    iphone_2x         : 'private/splash/iphone@2x.png',
    iphone5           : 'private/splash/iphone5.png',
    iphone6           : 'private/splash/iphone6.png',
    iphone6p_portrait : 'private/splash/iphone6p_portrait.png',
    iphone6p_landscape: 'private/splash/iphone6p_landscape.png',
    ipad_portrait     : 'private/splash/ipad_portrait.png',
    ipad_portrait_2x  : 'private/splash/ipad_portrait@2x.png',
    ipad_landscape    : 'private/splash/ipad_landscape.png',
    ipad_landscape_2x : 'private/splash/ipad_landscape@2x.png',

    android_ldpi_portrait  : 'private/splash/android-port-ldpi.png',
    android_ldpi_landscape : 'private/splash/android-land-ldpi.png',
    android_mdpi_portrait  : 'private/splash/android-port-mdpi.png',
    android_mdpi_landscape : 'private/splash/android-land-mdpi.png',
    android_hdpi_portrait  : 'private/splash/android-port-hdpi.png',
    android_hdpi_landscape : 'private/splash/android-land-hdpi.png',
    android_xhdpi_portrait : 'private/splash/android-port-xhdpi.png',
    android_xhdpi_landscape: 'private/splash/android-land-xhdpi.png'
});*/

// Set PhoneGap/Cordova preferences
//App.setPreference('xwalkCommandLine','--disable-gesture-requirement-for-media-playback');
App.setPreference('Orientation', 'portrait');
App.setPreference('HideKeyboardFormAccessoryBar', true);
App.setPreference('KeyboardDisplayRequiresUserAction', false);
App.setPreference('StatusBarOverlaysWebView', false);
App.setPreference('StatusBarStyle', 'lightcontent');
App.setPreference('StatusBarBackgroundColor', '#1bbc9b');
App.setPreference('ShowSplashScreenSpinner', false);
App.setPreference('android-targetSdkVersion', '19');
App.setPreference('android-minSdkVersion', '15');
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