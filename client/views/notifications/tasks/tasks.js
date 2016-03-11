//---------------------------------------------------
//  Tasks
//---------------------------------------------------

// Rendered
Template.tasks.onRendered(function(){
    console.log('tasks rendered...');
});

// Helpers
Template.tasks.helpers({
    tasks: function () {
        // TODO - Connect to DB
        return EqApp.tasks_data.get(); // Sample data
    }
});

// Events
Template.tasks.events({
    "click .mark-all-tasks-done": function (event) {
        event.preventDefault();

        // Remove
        //Meteor.call("tasks.remove_all");
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
    "click .remove-task": function (event) {
        // Remove
        Meteor.call("tasks.remove", this.id);
    }
});
