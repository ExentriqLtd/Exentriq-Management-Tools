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
                console.log('[Update notifyMissions] x', Session.get("missionsUpdatedNum"));
            }
            Meteor.subscribe("notifyMissions", EqApp.client.site.username(), Session.get("missionsUpdatedNum"));
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
    missions: function (type) {
        return EqApp.client.missions.all(type);
    },
    missions_num: function () {
        return EqApp.client.missions.count();
    },
    missions_completed_num: function () {
        return EqApp.client.missions.complete_count();
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
    },
    "click .eq-ui-card-title-text a": function (event) {
        event.preventDefault();
        // Go to url
        var url = $(event.currentTarget).attr('href');
        EqApp.client.notification.go_to_url(url, '_blank');
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

//---------------------------------------------------
//  Notifications Item Avatar
//---------------------------------------------------

// Rendered
Template.missions_item_avatar.onRendered(function(){
    var _data = Template.currentData();

    $('.trigger-dropdown-missions_item_avatar-'+_data.avatar_id).dropdown({
        inDuration: 300,
        outDuration: 225,
        hover: false,
        gutter: 0,
        belowOrigin: false
    });
});

// Events
Template.missions_item_avatar.events({

});