//---------------------------------------------------
//  Missions
//---------------------------------------------------

// Created
Template.missions.onCreated(function(){
    var template = this;

    Session.setDefault("missionsHideCompleted", true);
    Session.setDefault("missionsShowModalAdd", false);
    Session.setDefault("missionsUpdatedNum", 1);

    template.autorun(function() {
        if(Meteor.user() && Meteor.user().username){
            if(Meteor.settings.public.isDebug){
                console.log('[missions] username to token:', Meteor.user().username);
            }
            Meteor.subscribe("notifyMissions", EqApp.client.site.username(), Session.get("missionsUpdatedNum"));
            EqApp.client.missions.ws_update_all(); // Update all
        }
        console.log('autorun', Session.get("missionsUpdatedNum"));
    });
});

// Rendered
Template.missions.onRendered(function(){
    //console.log('missions rendered...');
});

// Helpers
Template.missions.helpers({
    missions: function (type) {
        //return EqApp.missions_data.get();
        var filter = {};
        if(type==='open'){
            filter.closed_on={$in:[null, '']};
        }
        else if(type==='closed'){
            filter.closed_on={$not:{$in:[null, '']}};
        }
        return NotifyMissions.find(filter, {sort: {points: -1}});
    },
    missions_num: function () {
        var filter = {};
        filter.closed_on={$in:[null, '']};
        return NotifyMissions.find(filter, {sort: {points: -1}}).count();
        //return EqApp.client.missions.count();
    },
    missions_completed_num: function () {
        var filter = {};
        filter.closed_on={$not:{$in:[null, '']}};
        return NotifyMissions.find(filter, {sort: {points: -1}}).count();
        //return EqApp.client.missions.complete_count();
    },
    missions_is_hide_completed: function () {
        return Session.get("missionsHideCompleted");
    },
    is_show_modal_add: function () {
        return Session.get("missionsShowModalAdd");
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

    },
    "click .trigger-eq-man-missions-modal-add": function (event) {
        event.preventDefault();
        Session.set("missionsShowModalAdd", true);
    }
});

//---------------------------------------------------
//  Missions Item
//---------------------------------------------------

// Rendered
Template.missions_item.onRendered(function(){
    //console.log('missions item rendered...');
});

// Events
Template.missions_item.events({
    "click .mark-complete": function (event) {
        // Set complete
        EqApp.client.missions.set_complete(this.id, !this.complete);
    }
});