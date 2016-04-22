Package.describe({
    name: 'exentriq-push',
    version: '0.0.1',
    summary: '',
    git: ''
});

Cordova.depends({
    'cordova-plugin-device': '1.1.1',
});

Package.onUse(function(api) {
    api.versionsFrom('1.2.1');

    // Use
    api.use('underscore');
    api.use('coffeescript');
    api.use('kadira:flow-router');
    api.use('push');
    api.addFiles('client/lib/cordova/push.coffee', 'client');
    api.addFiles('client/lib/exentriqPush.coffee', 'client');
    api.addFiles('server/lib/cordova.coffee', 'server');
    
    api.export('ExPush')

});