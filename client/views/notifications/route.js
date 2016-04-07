// Root Web
FlowRouter.route('/notifications', {
    action: function(params, queryParams) {
        route_action(params, queryParams);
    }
});

// Root App Cordova
if(EqApp.client.site.is_cordova() && Meteor.settings.public.rootAppCordoba === 'notifications'){
    FlowRouter.route('/', {
        action: function(params, queryParams) {
            $('html').addClass('is_cordova');
            route_action(params, queryParams);
        }
    });
}

var route_action = function (params, queryParams){
    $('body').addClass('tp_notifications_main');
    BlazeLayout.render('appView', {
        center: "notifications_main"
    });
};
