Package.describe({
    name: 'eq-meteor-lib',
    version: '0.1.0',
    summary: '',
    git: ''
});

Package.onUse(function(api) {
    api.versionsFrom('1.2.1');

    // Use
    api.use('underscore');
    api.use('jquery');
    api.use('tap:i18n');

    // Export
    api.export('tr');
    api.export('EqApp');

    // Config
    api.addFiles('config.js');

    // Common
    /*api.addFiles('common/helps.js');
    api.addFiles('common/object.js');
    api.addFiles('common/string.js');*/

    // Main
    api.addFiles('main.js');
});