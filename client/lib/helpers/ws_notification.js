// Set start point
if(!EqApp.client){EqApp.client = {};}
var _start_point = EqApp.client;

// Client -> notification
(function (mtr, $) {
    _start_point.notification = {};
    var _this = function(){return _start_point.notification;}();

    _this.window_load = false;

    _this.username = null;
    _this.service = null;
    _this.notify_sound = null;

    /* --------------------------------------- */
    /* Create task
    /* --------------------------------------- */
    _this.create_task = function (message) {
        var link = _this.parse_notifications_url(message);
        //var avatar = "http://www.exentriq.com/AvatarService?username=" + message.from_user;

        // Check is valid task
        if(!_this.is_valid('task', message)){return null;}

        // Build task
        return {
            "id": message.id,
            "subject": message.message,
            "action": link.url,
            "action_label": message.message,
            "from_users": message.from_user,
            "to_users": message.to_user,
            "complete": message.status === 'CLOSE',
            "date": message.timestamp
        };
    };

    /* --------------------------------------- */
    /* Update all tasks
    /* --------------------------------------- */
    _this.update_all_tasks = function (data) {

        var tasks = [];

        // Build array
        data.value.forEach(function(message){
            var item = _this.create_task(message);
            if(item){ tasks.push(item); } // Add
        });

        console.log('tasks', tasks);

        // Set react var
        EqApp.tasks_data.set(tasks);
    };

    /* --------------------------------------- */
    /* Tasks count
    /* --------------------------------------- */
    _this.tasks_count = function () {
        var _items = EqApp.tasks_data.get();
        var _items_new = [];
        for(var key in _items) {
            if (_items[key].complete === false) {
                _items_new.push(_items[key]);
            }
        }
        return _items_new.length;
    };

    /* --------------------------------------- */
    /* Tasks complete count
    /* --------------------------------------- */
    _this.tasks_complete_count = function () {
        var _items = EqApp.tasks_data.get();
        var _items_new = [];
        for(var key in _items) {
            if (_items[key].complete === true) {
                _items_new.push(_items[key]);
            }
        }
        return _items_new.length;
    };


    /* ------------------------------------------------------------------------------------ */


    /* --------------------------------------- */
    /* Create notification
    /* --------------------------------------- */
    _this.create_notification = function (message) {
        var link = _this.parse_notifications_url(message);
        var avatar = "http://www.exentriq.com/AvatarService?username=" + message.from_user;

        // Check is valid notification
        if(!_this.is_valid('notification', message)){return null;}

        // Build notification
        return {
            "id": message.id,
            "avatar": avatar,
            "from_user": message.from_user,
            "subject": message.subject,
            "action": link.url,
            "action_label": link.url_label,
            "unread": message.notified === 0,
            "date": message.timestamp
        };
    };

    /* --------------------------------------- */
    /* Update all notifications
    /* --------------------------------------- */
    _this.update_all_notifications = function (data) {

        var notifications = [];

        // Build array
        data.value.forEach(function(message){
            var item = _this.create_notification(message);
            if(item){ notifications.push(item); } // Add
        });

        // Set react var
        EqApp.notifications_data.set(notifications);
    };

    /* --------------------------------------- */
    /* Add notification
    /* --------------------------------------- */
    _this.add_notification = function (message) {

        var notifications = EqApp.notifications_data.get();
        var item = _this.create_notification(message);
        if(item){
            // Add
            notifications.unshift(item);

            // Play notify sound
            _this.notify_sound.play();

            // Set react var
            EqApp.notifications_data.set(notifications);
        }
    };

    /* --------------------------------------- */
    /* Read notification
    /* --------------------------------------- */
    _this.read_notification = function (id) {

        // Send to ws
        _this.ws_read_notification_by_id(id);

        // Update UI
        var notifications = EqApp.notifications_data.get();
        var is_update = false;
        for (var key in notifications) {
            if (notifications[key].id === id) {
                notifications[key].unread = false;
                is_update = true;
            }
        }
        if(is_update){EqApp.notifications_data.set(notifications);}
    };

    /* --------------------------------------- */
    /* Read all notifications
    /* --------------------------------------- */
    _this.read_all_notifications = function () {

        // Update UI
        var notifications = EqApp.notifications_data.get();
        var is_update = false;
        for (var key in notifications) {
            var _item = notifications[key];
            if (_item.unread === true) {
                // Send to ws
                _this.ws_read_notification_by_id(_item.id);

                notifications[key].unread = false;
                is_update = true;
            }
        }
        if(is_update){EqApp.notifications_data.set(notifications);}
    };

    /* --------------------------------------- */
    /* Remove notification
    /* --------------------------------------- */
    _this.remove_notification = function (id) {

        // Send to ws
        _this.ws_remove_notification_by_id(id);

        // Update UI
        var notifications = EqApp.notifications_data.get();
        var is_update = false;
        for (var key in notifications) {
            if (notifications[key].id === id) {
                notifications.splice(key, 1);
                is_update = true;
            }
        }
        if(is_update){EqApp.notifications_data.set(notifications);}
    };

    /* --------------------------------------- */
    /* Remove all notifications
    /* --------------------------------------- */
    _this.remove_all_notifications = function () {

        // Update UI
        var notifications = EqApp.notifications_data.get();
        var is_update = false;
        for (var key in notifications) {
            var _item = notifications[key];
            // Send to ws
            _this.ws_remove_notification_by_id(_item.id);
            is_update = true;
        }
        if(is_update){EqApp.notifications_data.set([]);}
    };

    /* --------------------------------------- */
    /* Notifications count
    /* --------------------------------------- */
    _this.notifications_count = function () {
        var _items = EqApp.notifications_data.get();
        var _items_new = [];
        for(var key in _items) {
            if (_items[key].unread === true) {
                _items_new.push(_items[key]);
            }
        }
        return _items_new.length;
    };

    /* --------------------------------------- */
    /* Helps
    /* --------------------------------------- */

    // Parse notifications url
    _this.parse_notifications_url = function(object) {
        var _url = Meteor.settings.public.rootPath;
        var _link = object.link.replace(new RegExp('&#x2F;', 'g'), "/").replace(new RegExp('&amp;', 'g'), "&");
        var _link_label = object.type;

        // Is board
        if(_link.indexOf("/boards")===0){
            _link = "/emawrap?path="+_link.substring(1,_link.length);
        }

        // Resource type
        switch(object.type) {
            case 'card':
            case 'task':
                _url += '/manager' + _link + '&menu=projects-manage';
                break;
            case 'qa-request':
            case 'support-request':
            case 'chat-request':
                _url += '/manager' + _link + '&menu=support-manage';
                break;
            default:
                _url += '/manager' + _link + '&menu=projects-manage';
        }

        // Link label
        if(BasUtils.string.is_string(_link_label) && _link_label !== ''){
            _link_label = _link_label.replace(new RegExp('-', 'g'), " ");
        } else {
            _link_label = 'projects manage';
        }

        return {
            "url": _url,
            "url_label": _link_label
        };
    };

    // Is valid
    _this.is_valid = function(validate, object) {
        var link = object.link;
        link = link.replace("&#x2F;","/");
        var from_user = object.from_user;
        var subject = object.subject;
        var type = object.type;
        var valid = true;

        // Validate
        switch(validate) {
            case 'notification':
                if(link.indexOf("/channel")==0 || link.indexOf("/direct")==0){valid=false;}
                if(subject.indexOf("chat.unreadmessages:")==0){valid=false;}
                if(type == "TASK_STATUS"){valid=false;}
                if(from_user.indexOf("talk.stage")>-1){valid=false;}
                break;
            case 'task':
                valid=false;
                if(type == "TASK_STATUS"){valid=true;}

                if(link.indexOf("/channel")==0 || link.indexOf("/direct")==0){valid=false;}
                if(subject.indexOf("chat.unreadmessages:")==0){valid=false;}
                if(from_user.indexOf("talk.stage")>-1){valid=false;}
                break;
            default:
                valid=false;
        }

        return valid;
    };

    // Go to url
    _this.go_to_url = function (url, target) {
        if(url === null || target === null){ return; }
        window.open(url, target);
    };

    /* --------------------------------------- */
    /* WS Helps
    /* --------------------------------------- */

    // Read notification by id
    _this.ws_read_notification_by_id = function (id) {
        var msg = {'cmd':'READ'};
        msg.value=id;
        _this.service.send(JSON.stringify(msg));
    };

    // UnRead notification by id
    _this.ws_unread_notification_by_id = function (id) {
        var msg = {'cmd':'UNREAD'};
        msg.value=id;
        _this.service.send(JSON.stringify(msg));
    };

    // Remove notification by id
    _this.ws_remove_notification_by_id = function (id) {
        var msg = {'cmd':'DELETE'};
        msg.value=id;
        _this.service.send(JSON.stringify(msg));
    };

    // List all notifications
    _this.ws_list_all_notifications = function () {
        var msg = {'cmd':'ALL'};
        msg.value=_this.username;
        _this.service.send(JSON.stringify(msg));
    };

    // New notifications
    _this.ws_new_notifications = function () {
        var msg = {'cmd':'NEW'};
        msg.value=_this.username;
        _this.service.send(JSON.stringify(msg));
    };

    // Show new notifications
    _this.ws_show_new_notifications = function () {
        var msg = {'cmd':'SHOW_NEW'};
        msg.value=_this.username;
        _this.service.send(JSON.stringify(msg));
    };

    // Init
    _this.init = function() {
        //...
    };

    // Update
    _this.update = function() {
        // ...
    };

    $(document).ready(function() {
        // Init
        _this.init();

        // Update
        _this.update();

        // Resize
        $(window).resize( function() {

            _this.update();

        });

        // Load complete
        $(window).load(function(){
            _this.window_load = true;
        });
    });

    // Meteor Init
    _this.mtr_init = function() {
        // Set notify sound
        _this.notify_sound = new buzz.sound('http://talk.exentriq.com/sounds/notify.mp3');

        // Set username
        if(Meteor.user()){
            _this.username = Meteor.user().username;
        }

        // Debug
        if(Meteor.settings.public.isDebug){
            // Get Query
            var query_string = EqUI.site.query_string;

            // Is username
            if(query_string.debugUsername !== undefined) {
                _this.username = query_string.debugUsername;
            }
        }

        // Socket
        _this.service = new WebSocket(Meteor.settings.public.notificationBusPath);

        // Message
        _this.service.onmessage = function(event){
            var data = $.parseJSON(event.data);

            // Debug
            if(Meteor.settings.public.isDebug){ console.log('new message', data); }

            if(!_this.username){return;}

            if(data.cmd==='LIST_ALL'){

                // Update all notifications
                _this.update_all_notifications(data);

                // Update all tasks
                _this.update_all_tasks(data);

            }
            else if(data.cmd==='NOTIFICATION'){

                // Add notification
                _this.add_notification(data.value);

            }
        };

        _this.service.onopen = function(){
            console.log('open...');

            // List all notifications
            _this.ws_list_all_notifications();

            // New notifications
            _this.ws_new_notifications();
        };

        _this.service.onclose = function(evt) { console.log(evt); };

        _this.service.onerror = function(evt) { console.log(evt); };
    };

    // Meteor startup
    mtr.startup(function () {
        // Init
        _this.mtr_init();
    });

}( Meteor, jQuery ));
