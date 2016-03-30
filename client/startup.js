Meteor.startup(function () {
    // Set app language
    EqApp.client.site.set_app_language('en');

    // Global Helpers
    Template.registerHelper('is_cordova', function() {
        return EqApp.client.site.is_cordova();
    });
    Template.registerHelper('is_desktop', function() {
        return !EqApp.client.site.is_cordova();
    });
});
