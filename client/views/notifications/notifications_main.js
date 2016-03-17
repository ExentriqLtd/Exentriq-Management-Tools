// Rendered
Template.notifications_main.onRendered(function(){
    //console.log('notifications_main rendered...');
});

// Helpers
Template.notifications_main.helpers({
    notifications_num: function () {
        return EqApp.client.notification.notifications_count();
    },
    tasks_num: function () {
        return EqApp.client.tasks.count();
    },
    missions_num: function () {
        // TODO
        return 0;
    }
});
