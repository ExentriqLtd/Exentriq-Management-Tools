//---------------------------------------------------
//  Tasks
//---------------------------------------------------

// Created
Template.tasks.onCreated(function(){
    var template = this;

    Session.setDefault("tasksFiltersOrderByPoints", true);
    Session.setDefault("tasksFiltersOrderByCreationDate", false);

    Session.setDefault("tasksHideCompleted", true);
    Session.setDefault("tasksShowModalAdd", false);
    Session.setDefault("tasksUpdatedNum", 1);

    template.autorun(function() {
        if(Meteor.user() && Meteor.user().username){
            if(Meteor.settings.public.isDebug){
                console.log('[tasks] username to token:', Meteor.user().username);
                console.log('[Update notifyTasks] x', Session.get("tasksUpdatedNum"));
            }
            Meteor.subscribe("notifyTasks", EqApp.client.site.username(), Session.get("tasksUpdatedNum"));
        }
        //console.log('autorun');
    });
});

// Rendered
Template.tasks.onRendered(function(){
    $('.trigger-dropdown-tasks-filters-order-by').dropdown({
        inDuration: 300,
        outDuration: 225,
        hover: true,
        gutter: 0,
        belowOrigin: false
    });

    $('.trigger-tasks-dropdown-header-mobile-menu').dropdown({
        inDuration: 300,
        outDuration: 225,
        hover: true,
        gutter: 0,
        belowOrigin: false
    });
});

// Helpers
Template.tasks.helpers({
    tasks: function (type) {
        return EqApp.client.tasks.all(type);
    },
    tasks_num: function () {
        return EqApp.client.tasks.count();
    },
    tasks_completed_num: function () {
        return EqApp.client.tasks.complete_count();
    },
    tasks_is_hide_completed: function () {
        return Session.get("tasksHideCompleted");
    },
    is_show_modal_add: function () {
        return Session.get("tasksShowModalAdd");
    },
    filters_order_by_points: function () {
        return Session.get("tasksFiltersOrderByPoints");
    },
    filters_order_by_creation_date: function () {
        return Session.get("tasksFiltersOrderByCreationDate");
    }
});

// Events
Template.tasks.events({
    "click .eq-man-tasks-filters-order-by-points": function (event) {
        event.preventDefault();
        EqApp.client.tasks.reset_all_filters();
        Session.set("tasksFiltersOrderByPoints", true);
    },
    "click .eq-man-tasks-filters-order-by-creation-date": function (event) {
        event.preventDefault();
        EqApp.client.tasks.reset_all_filters();
        Session.set("tasksFiltersOrderByCreationDate", true);
    },
    "click .mark-all-tasks-done, click .eq-man-header-mobile-menu-mark-all-tasks-done": function (event) {
        event.preventDefault();
        Session.set("tasksHideCompleted", true);
        $('.eq-man-tasks-list-completed').css('display','none');
        EqApp.client.tasks.set_all_complete();
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

    },
    "click .trigger-eq-man-tasks-modal-add": function (event) {
        event.preventDefault();
        Session.set("tasksShowModalAdd", true);
    },
    "click .eq-ui-card-title-text a": function (event) {
        event.preventDefault();
        // Go to url
        if(!Meteor.isCordova) {
            var url = $(event.currentTarget).attr('href');
            EqApp.client.notification.go_to_url(url, '_blank');
        }
    }
});

//---------------------------------------------------
//  Notifications Item
//---------------------------------------------------

// Rendered
Template.tasks_item.onRendered(function(){
    var _data = Template.currentData();

    $('.trigger-dropdown-tasks_item_to_more_avatars-'+_data.id).dropdown({
        inDuration: 300,
        outDuration: 225,
        hover: false,
        gutter: 0,
        belowOrigin: false
    });
});

// Helpers
Template.tasks_item.helpers({
    assigned_to_visible: function () {
        var _data = Template.currentData();
        if(_data.assigned_to.length > 4){
            return _data.assigned_to.slice(0, 3); // Show 3
        } else {
            return _data.assigned_to;
        }
    },
    assigned_to_hidden: function () {
        var _data = Template.currentData();
        if(_data.assigned_to.length > 4){
            return _data.assigned_to.slice(3);
        } else {
            return [];
        }
    }
});

// Events
Template.tasks_item.events({
    "click .mark-complete": function (event) {
        // Set complete
        EqApp.client.tasks.set_complete(this.id, !this.complete);
    }
});

//---------------------------------------------------
//  Notifications Item Avatar
//---------------------------------------------------

// Rendered
Template.tasks_item_avatar.onRendered(function(){
    var _data = Template.currentData();
    
    $('.trigger-dropdown-tasks_item_avatar-'+_data.avatar_id).dropdown({
        inDuration: 300,
        outDuration: 225,
        hover: false,
        gutter: 0,
        belowOrigin: false
    });
});

// Events
Template.tasks_item_avatar.events({

});
