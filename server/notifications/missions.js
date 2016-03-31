var subs_notifyMissions = {};

Meteor.publish('notifyMissions', function(username, fake_update_num) {
    var self = this;
    subs_notifyMissions[self._session.id] = self;

    try {

        var apiUrl = Meteor.settings.private.integrationBusPath + '/getUserMissions?username=' + encodeURIComponent(username);
        var response = HTTP.get(apiUrl);

        console.log('update missions x', fake_update_num);

        _.each(response.data.result, function(item) {
            var _item = build_item(item);
            self.added('notifyMissions', _item.id, _item);
        });

        self.ready();

        self.onStop(function () {
            delete subs_notifyMissions[self._session.id];
        });

    } catch (error) {
        console.log(error);
    }
});


Meteor.methods({
    'missions.add': function(data){
        this.unblock();
        var apiUrl = Meteor.settings.private.integrationBusPath + '/createMission';
        return Rest.post(apiUrl, data);
    },
    'missions.open': function(data, doc){
        // Update UI
        _.each(subs_notifyMissions, function(sub) {
            try {
                sub.changed('notifyMissions', doc.id, doc);
            } catch (error) {
                console.log(error);
            }
        });
        
        // Update WS
        this.unblock();
        var apiUrl = Meteor.settings.private.integrationBusPath + '/updateMission';
        return Rest.post(apiUrl, data);
    }
});


/* --------------------------------------- */
/* HELPS
/* --------------------------------------- */

// Build item
var build_item = function (item) {
    var assigned_from = [];
    var assigned_to = [];

    // Build avatars from
    if(item.content.author){
        assigned_from.push({
            avatar_id:EqApp.lib.common.guid(),
            avatar:EqApp.lib.common.avatar(item.content.author),
            user:item.content.author,
            type:'from'
        });
    }

    // Build avatars to
    item.content.users.forEach(function(user){
        assigned_to.push({
            avatar_id:EqApp.lib.common.guid(),
            avatar:EqApp.lib.common.avatar(user),
            user:user,
            type:'to'
        });
    });

    var _url = "";//Meteor.settings.public.rootPath;

    // Build
    return {
        "id": item.id,
        "subject": item.content.clean || '&nbsp;',
        "action": _url + "/manager/management-tools?spaceid=" + item.content.space + "&menu=sprintplanner",
        "points": item.content.points || 0,

        "assigned_from": assigned_from,
        "assigned_to": assigned_to,

        "effort": item.content.days || 0,
        "eta": item.content.eta || '',
        "closed_on": item.content.closed_on || null,

        "milestone": item.content.milestone || '',
        "project": item.boardTitle || '',
        "card": item.content.card || '',

        "progress": item.content.progress || 0,

        "complete": item.status
    };
};