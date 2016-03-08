FlowRouter.route('/notifications', {
    action: function(params, queryParams) {
        //if (params.companyId) {
            /*Template.notifications_main.render({
                cmpId: params.companyId
            });*/
            $('body').addClass('tp_notifications_main');
            BlazeLayout.render('appView', {
                center: "notifications_main"
            });
        //}
    }
});
