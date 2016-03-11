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
        var _completed = EqApp.tasks_data.get();
        var _completed_new = [];
        for(var key in _completed) {
            if (_completed[key].complete === false) {
                _completed_new.push(_completed[key]);
            }
        }
        return _completed_new.length; // Sample data
    },
    missions_num: function () {
        // TODO - Connect to DB
        return 0; // Sample data
    }
});
