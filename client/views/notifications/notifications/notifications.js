//---------------------------------------------------
//  Notifications
//---------------------------------------------------

// Created
Template.notifications.onCreated(function(){
    var template = this;

    template.autorun(function() {
        if(Meteor.user() && Meteor.user().username){
            if(Meteor.settings.public.isDebug){
                console.log('[notifications] username to token:', Meteor.user().username);
            }
            if(!EqApp.client.notification.service_is_init){
                EqApp.client.notification.ws_init(); // Init
            }
        }
        //console.log('autorun');
    });
});

// Rendered
Template.notifications.onRendered(function(){
    // console.log('notifications rendered...');
});

// Helpers
Template.notifications.helpers({
    notifications: function () {
        return EqApp.notifications_data.get();
    },
    notifications_num: function () {
        return EqApp.client.notification.notifications_count();
    }
});

// Events
Template.notifications.events({
    "click .mark-all-notify": function (event) {
        event.preventDefault();

        // Read all
        EqApp.client.notification.read_all_notifications();
    },
    "click .remove-all-notify": function (event) {
        event.preventDefault();

        // Remove all
        EqApp.client.notification.remove_all_notifications();
    }
});

//---------------------------------------------------
//  Notifications Item
//---------------------------------------------------

// Rendered
Template.notifications_item.onRendered(function(){
    // console.log('notifications item rendered...');
});

// Events
Template.notifications_item.events({
    "click .eq-ui-list-title a": function (event) {
        event.preventDefault();

        // Read
        EqApp.client.notification.read_notification(this.id);

        // Go to url
        var url = $(event.currentTarget).attr('href');
        EqApp.client.notification.go_to_url(url, '_blank');
    },
    "click .remove-notify": function (event) {
        // Remove
        EqApp.client.notification.remove_notification(this.id);
    }
});
