var subs_notifyTasks = {};

Meteor.publish('notifyTasks', function(username, fake_update_num) {
    var self = this;
    subs_notifyTasks[self._session.id] = self;

    try {

        var apiUrl = Meteor.settings.private.integrationBusPath + '/getUserTasks?username=' + encodeURIComponent(username);
        var response = HTTP.get(apiUrl);

        console.log('update tasks x', fake_update_num);

        _.each(response.data.result, function(item) {
            var _item = build_item(item);
            self.added('notifyTasks', _item.id, _item);
        });

        self.ready();

        self.onStop(function () {
            delete subs_notifyTasks[self._session.id];
        });

    } catch (error) {
        console.log(error);
    }
});


Meteor.methods({
    'tasks.add': function(data){
        this.unblock();
        var apiUrl = Meteor.settings.private.integrationBusPath + '/createTask';
        return Rest.post(apiUrl, data);
    },
    'tasks.open': function(data, doc){
        // Update UI
        _.each(subs_notifyTasks, function(sub) {
            sub.changed('notifyTasks', doc.id, doc);
        });

        // Update WS
        this.unblock();
        var apiUrl = Meteor.settings.private.integrationBusPath + '/updateTask';
        return Rest.post(apiUrl, data);
    }
});


/* --------------------------------------- */
/* HELPS
/* --------------------------------------- */

// Build item
var build_item = function (item) {
    var link = parse_url(item);
    var assigned_from = [];
    var assigned_to = [];

    // Build avatars from
    if(item.content.author){
        assigned_from.push({avatar:EqApp.lib.common.avatar(item.content.author)});
    }

    // Build avatars to
    item.content.users.forEach(function(user){
        assigned_to.push({avatar:EqApp.lib.common.avatar(user)});
    });

    // Build
    return {
        "id": item.id,
        "subject": item.content.clean || '&nbsp;',
        "action": link || '#',

        "points": item.content.points || 0,

        "assigned_from": assigned_from,
        "assigned_to": assigned_to,

        "effort": item.content.days || 0,
        "eta": item.content.eta || '',
        "closed_on": item.content.closed_on || null,

        "milestone": item.content.milestone || '',
        "project": item.boardTitle || '',
        "card": '',

        "progress": item.content.progress || 0,

        "complete": item.status
    };
};

// Parse url
var parse_url = function(object) {
    var _url = Meteor.settings.public.rootPath;
    var _link = object.link.replace(new RegExp('&#x2F;', 'g'), "/").replace(new RegExp('&amp;', 'g'), "&");
    
    // Is board
    if(_link.indexOf("/boards")===0){
        _link = "/emawrap?path="+_link.substring(1,_link.length);
    }
    
    _url += '/manager' + _link + '&menu=projects-manage';
    
    return _url;
};