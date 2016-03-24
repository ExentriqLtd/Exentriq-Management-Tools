Meteor.methods({
    'missions.get_all': function(username){
        this.unblock();
        var apiUrl = Meteor.settings.private.integrationBusPath + '/getUserMissions?username=' + encodeURIComponent(username);
        return Rest.get(apiUrl);
    },
    'missions.add': function(data){
        this.unblock();
        var apiUrl = Meteor.settings.private.integrationBusPath + '/createMission';
        return Rest.post(apiUrl, data);
    },
    'missions.open': function(data){
        this.unblock();
        var apiUrl = Meteor.settings.private.integrationBusPath + '/updateMission';
        return Rest.post(apiUrl, data);
    }
});

Meteor.publish('notifyMissions', function(username, fake_update_num) {
    var self = this;

    try {

        var apiUrl = Meteor.settings.private.integrationBusPath + '/getUserMissions?username=' + encodeURIComponent(username);
        var response = HTTP.get(apiUrl);

        console.log('update missions...');

        _.each(response.data.result, function(item) {
            var _item = build_item(item);

            console.log(_item.id);

            self.added('notifyMissions', _item.id, _item);
        });

        self.ready();

    } catch (error) {
        console.log(error);
    }
});

/* --------------------------------------- */
/* Build item
/* --------------------------------------- */
var build_item = function (item) {
    var assigned_from = [];
    var assigned_to = [];

    // Avatar from
    if(item.content.author){
        assigned_from.push({avatar:EqApp.lib.common.avatar(item.content.author)});
    }

    // Build avatars
    item.content.users.forEach(function(user){
        assigned_to.push({avatar:EqApp.lib.common.avatar(user)});
    });

    // Build
    return {
        "id": item.id,
        "subject": item.content.clean || '&nbsp;',

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