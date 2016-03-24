if(!EqApp.notifications){EqApp.notifications = {};}

// Created
Template.notifications_main.onCreated(function() {
    var space = EqApp.client.site.space();
    Meteor.subscribe("appUsers");
    var username = Meteor.user().username;
    Meteor.subscribe("userBoards", username, null);
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
        var filter = {};
        filter.closed_on={$in:[null, '']};
        return NotifyMissions.find(filter, {sort: {points: -1}}).count();
        //return EqApp.client.missions.count();
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
        limit: 6,
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
