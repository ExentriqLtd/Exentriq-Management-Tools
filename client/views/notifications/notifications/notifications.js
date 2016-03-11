//---------------------------------------------------
//  Notifications
//---------------------------------------------------

// Rendered
Template.notifications.onRendered(function(){
    console.log('notifications rendered...');
});

// Helpers
Template.notifications.helpers({
    notifications: function () {
        // TODO - Connect to DB
        return EqApp.notifications_data.get(); // Sample data
    }
});

// Events
Template.notifications.events({
    "click .remove-all-notify": function (event) {
        event.preventDefault();

        // Remove
        Meteor.call("notifications.remove_all");
    }
});

//---------------------------------------------------
//  Notifications Item
//---------------------------------------------------

// Rendered
Template.notifications_item.onRendered(function(){
    console.log('notifications item rendered...');
});

// Events
Template.notifications_item.events({
    "click .remove-notify": function (event) {
        // Remove
        Meteor.call("notifications.remove", this.id);
    }
});
