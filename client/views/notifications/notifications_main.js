// Rendered
Template.notifications_main.onRendered(function(){
    console.log('notifications_main rendered...');
});

// Helpers
Template.notifications_main.helpers({
    notifications_num: function () {
        // TODO - Connect to DB
        return EqApp.notifications_data.get().length; // Sample data
    },
    tasks_num: function () {
        // TODO - Connect to DB
        return EqApp.tasks_data.get().length; // Sample data
    },
    missions_num: function () {
        // TODO - Connect to DB
        return 0; // Sample data
    }
});
