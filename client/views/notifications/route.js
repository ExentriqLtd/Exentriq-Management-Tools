FlowRouter.route('/notifications', {
    action: function(params, queryParams) {
        $('body').addClass('tp_notifications_main');
        BlazeLayout.render('appView', {
            center: "notifications_main"
        });
    }
});
