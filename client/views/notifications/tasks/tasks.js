//---------------------------------------------------
//  Tasks
//---------------------------------------------------

// Created
Template.tasks.onCreated(function(){
    var template = this;

    Session.setDefault("tasksHideCompleted", true);

    template.autorun(function() {
        if(Meteor.user() && Meteor.user().username){
            if(Meteor.settings.public.isDebug){
                console.log('[tasks] username to token:', Meteor.user().username);
            }
            EqApp.client.tasks.ws_update_all(); // Update all
        }
        //console.log('autorun');
    });
});

// Rendered
Template.tasks.onRendered(function(){
    //console.log('tasks rendered...');
});

// Helpers
Template.tasks.helpers({
    tasks: function () {
        return EqApp.tasks_data.get();
    },
    tasks_num: function () {
        return EqApp.client.tasks.count();
    },
    tasks_completed_num: function () {
        return EqApp.client.tasks.complete_count();
    },
    tasks_is_hide_completed: function () {
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
    //console.log('tasks item rendered...');
});

// Events
Template.tasks_item.events({
    "click .mark-complete": function (event) {
        // Remove
        Meteor.call("tasks.set_complete", this.id, !this.complete);
    }
});
