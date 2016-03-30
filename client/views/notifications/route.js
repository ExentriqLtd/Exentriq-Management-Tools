FlowRouter.route('/notifications', {
    action: function(params, queryParams) {
        $('body').addClass('tp_notifications_main');
        if(EqApp.client.site.is_cordova()){
            $('html').addClass('is_cordova');
        }
        BlazeLayout.render('appView', {
            center: "notifications_main"
        });
    }
});
