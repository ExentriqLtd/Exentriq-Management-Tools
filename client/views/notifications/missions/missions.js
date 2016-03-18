//---------------------------------------------------
//  Missions
//---------------------------------------------------

// Created
Template.missions.onCreated(function(){
    var template = this;

    Session.setDefault("missionsHideCompleted", true);

    template.autorun(function() {
        if(Meteor.user() && Meteor.user().username){
            if(Meteor.settings.public.isDebug){
                console.log('[missions] username to token:', Meteor.user().username);
            }
            EqApp.client.missions.ws_update_all(); // Update all
        }
        //console.log('autorun');
    });
});

// Rendered
Template.missions.onRendered(function(){
    //console.log('missions rendered...');
});

// Helpers
Template.missions.helpers({
    missions: function () {
        return EqApp.missions_data.get();
    },
    missions_num: function () {
        return EqApp.client.missions.count();
    },
    missions_completed_num: function () {
        return EqApp.client.missions.complete_count();
    },
    missions_is_hide_completed: function () {
        return Session.get("missionsHideCompleted");
    }
});

// Events
Template.missions.events({
    "click .mark-all-missions-done": function (event) {
        event.preventDefault();
        Session.set("missionsHideCompleted", true);
        $('.eq-man-missions-list-completed').css('display','none');
        EqApp.client.missions.set_all_complete();
    },
    "click .show-all-missions-completed": function (event) {
        event.preventDefault();
        Session.set("missionsHideCompleted", false);
        $('.eq-man-missions-list-completed').css('display','block');
    },
    "click .hide-all-missions-completed": function (event) {
        event.preventDefault();
        Session.set("missionsHideCompleted", true);
        $('.eq-man-missions-list-completed').css('display','none');

    }
});

//---------------------------------------------------
//  Missions Item
//---------------------------------------------------

// Rendered
Template.missions_item.onRendered(function(){
    //console.log('tasks item rendered...');
});

// Events
Template.missions_item.events({
    "click .mark-complete": function (event) {
        // Set complete
        EqApp.client.missions.set_complete(this.id, !this.complete);
    }
});
