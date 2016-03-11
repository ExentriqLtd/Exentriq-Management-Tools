//---------------------------------------------------
//  Tasks
//---------------------------------------------------

// Rendered
Template.tasks.onRendered(function(){
    console.log('tasks rendered...');

    Session.set("tasksHideCompleted", true);
});

// Helpers
Template.tasks.helpers({
    tasks: function () {
        // TODO - Connect to DB
        // Sample data
        return EqApp.tasks_data.get();
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
    tasks_completed_num: function () {
        // TODO - Connect to DB
        var _completed = EqApp.tasks_data.get();
        var _completed_new = [];
        for(var key in _completed) {
            if (_completed[key].complete === true) {
                _completed_new.push(_completed[key]);
            }
        }
        return _completed_new.length; // Sample data
    },
    tasks_is_hide_completed: function () {
        // TODO - Connect to DB
        return Session.get("tasksHideCompleted");
    }
});

// Events
Template.tasks.events({
    "click .mark-all-tasks-done": function (event) {
        event.preventDefault();
        Session.set("tasksHideCompleted", true);
        $('.eq-man-tasks-list-completed').css('display','none');
        Meteor.call("tasks.set_all_complete");
    },
    "click .show-all-tasks-completed": function (event) {
        event.preventDefault();
        Session.set("tasksHideCompleted", false);
        $('.eq-man-tasks-list-completed').css('display','block');
    },
    "click .hide-all-tasks-completed": function (event) {
        event.preventDefault();
        Session.set("tasksHideCompleted", true);
        $('.eq-man-tasks-list-completed').css('display','none');

    }
});

//---------------------------------------------------
//  Notifications Item
//---------------------------------------------------

// Rendered
Template.tasks_item.onRendered(function(){
    console.log('tasks item rendered...');
});

// Events
Template.tasks_item.events({
    "click .mark-complete": function (event) {
        // Remove
        Meteor.call("tasks.set_complete", this.id, !this.complete);
    }
});
