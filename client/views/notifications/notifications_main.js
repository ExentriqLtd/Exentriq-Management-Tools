if(!EqApp.notifications){EqApp.notifications = {};}

var notifyInterval;

// Destroyed
Template.notifications_main.onDestroyed(function () {
    Meteor.clearInterval(notifyInterval);
});

// Created
Template.notifications_main.onCreated(function() {
    var template = this;
    var space = EqApp.client.site.space();
    Meteor.subscribe("appUsers");

    // Main Interval (5 min.)
    var notifyIntervalTime = 60000*5;
    notifyInterval = Meteor.setInterval(function() {
        if(Meteor.settings.public.isDebug){
            console.log('[Auto Update tasks and missions]');
        }
        // Update tasks
        EqApp.client.tasks.updateCollection();

        // Update missions
        EqApp.client.missions.updateCollection();
    }, notifyIntervalTime);

    // Autorun
    template.autorun(function() {
        if(Meteor.user() && Meteor.user().username){
            if(Meteor.settings.public.isDebug){
                console.log('[notifications main] username to token:', Meteor.user().username);
            }
            Meteor.subscribe("userBoards", EqApp.client.site.username(), null);
        }
        //console.log('autorun');
    });
});

// Rendered
Template.notifications_main.onRendered(function(){
    //console.log('notifications_main rendered...');
});

// Helpers
Template.notifications_main.helpers({
    notifications_num: function () {
        return EqApp.client.notification.notifications_count();
    },
    tasks_num: function () {
        return EqApp.client.tasks.count();
    },
    missions_num: function () {
        return EqApp.client.missions.count();
    },
    classes: function () {
        var _classes = '';
        if(Meteor.settings.public.isDebug){
            _classes += ' is-debug';
        }
        return _classes;
    }
});

// Global Helps
EqApp.notifications.autocompleteReplace = function(event, template, doc, fieldName){
    var replaceFrom;
    var replaceTo;
    if(doc.hasOwnProperty('title')){
        replaceFrom = '#'+doc.title;
        replaceTo = "#\""+doc.title+"\"";
    }
    else{
        replaceFrom = '@'+doc.username;
        replaceTo = "@\""+doc.username+"\"";
    }
    var statementDom = template.find(fieldName);
    var statement = statementDom.value.replace(replaceFrom, replaceTo);
    $(statementDom).val(statement);
};

EqApp.notifications.autocompleteSettings = function() {
    return {
        position: "top",
        limit: 100,
        rules: [
            {
                token: '@',
                collection: AppUsers,
                field: "username",
                template: Template.notifyUserPill,
                noMatchTemplate: Template.noMatch
            },
            {
                token: '#',
                collection: UserBoards,
                field: "title",
                template: Template.notifyBoardPill,
                noMatchTemplate: Template.noMatch
            }
        ]
    };
};
