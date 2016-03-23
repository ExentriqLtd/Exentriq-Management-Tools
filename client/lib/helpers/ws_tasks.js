// Set start point
if(!EqApp.client){EqApp.client = {};}
var _start_point = EqApp.client;

// Client -> tasks
(function (mtr, $) {
    _start_point.tasks = {};
    var _this = function(){return _start_point.tasks;}();

    _this.window_load = false;

    /* --------------------------------------- */
    /* Build
    /* --------------------------------------- */
    _this.build = function (task) {
        var link = _this.parse_url(task);
        var assigned_from = [];
        var assigned_to = [];

        // Build avatars
        task.content.users.forEach(function(user){
            assigned_to.push({avatar:_this.avatar(user)});
        });

        //console.log('task', task);

        // Build task
        return {
            "id": task.id,
            "subject": task.content.clean || '&nbsp;',
            "action": link || '#',

            "points": task.content.points || 0,

            "assigned_from": assigned_from,
            "assigned_to": assigned_to,

            "effort": task.content.days || 0,
            "eta": task.content.eta || '',
            "closed_on": task.content.closed_on || null,

            "milestone": task.content.milestone || '',
            "project": task.boardTitle || '',
            "card": '',

            "progress": task.content.progress || 0,

            "complete": task.status
        };
    };

    /* --------------------------------------- */
    /* Update all
    /* --------------------------------------- */
    _this.update_all = function (data) {

        var tasks = [];

        // Build array
        data.result.forEach(function(task){
            var item = _this.build(task);
            if(item){ tasks.push(item); } // Add
        });

        //console.log('tasks', tasks);

        // Set react var
        EqApp.tasks_data.set(tasks);
    };

    /* --------------------------------------- */
    /* Add
    /* --------------------------------------- */
    _this.add = function (statementEml) {

        // Data
        var data = {
            username: EqApp.client.site.username(),
            message: statementEml
        };

        //console.log('data', data);

        // WS Add
        _this.ws_add(function(result, error){
            if(result){
                if(result.status === 'fail'){
                    console.log('error:', result.error);
                    EqApp.client.site.toast.error('Error for Create Task: ' + result.error);
                } else {
                    console.log('add', result);
                    _this.ws_update_all();
                    EqApp.client.site.toast.success("Create Task Successfully");
                }
            } else if (error){
                console.log('error:', error);
            }
        }, data);
    };

    /* --------------------------------------- */
    /* Set complete
    /* --------------------------------------- */
    _this.set_complete = function (id, value) {

        // Data
        var data = {
            id: id,
            open: !value === true ? "true":"false"
        };

        //console.log('data', data);

        // Update UI
        var tasks = EqApp.tasks_data.get();
        var is_update = false;
        var key_update = null;
        for (var key in tasks) {
            if (tasks[key].id === id) {
                tasks[key].complete = value;
                key_update = key;
                is_update = true;
            }
        }
        if(is_update){EqApp.tasks_data.set(tasks);}

        // WS Open
        _this.ws_open(function(result, error){
            if(result){
                if(result.status === 'fail'){
                    console.log('error:', result.error);
                } else {
                    console.log('success:', result);
                    // Update UI
                    /*if(key_update && result.data){
                        var tasks = EqApp.tasks_data.get();
                        tasks[key_update].closed_on = result.data.closed_on || null;
                        EqApp.tasks_data.set(tasks);
                    }*/
                }
            } else if (error){
                console.log('error:', error);
            }
        }, data);
    };

    /* --------------------------------------- */
    /* Set all complete
    /* --------------------------------------- */
    _this.set_all_complete = function () {

        // Update UI
        var tasks = EqApp.tasks_data.get();
        //var is_update = false;
        for (var key in tasks) {
            var _item = tasks[key];
            if (_item.complete === false) {
                _this.set_complete(tasks[key].id, true);

                // Send to ws
                //_this.ws_set_complete_by_id(_item.id);

                //tasks[key].complete = true;
                //is_update = true;
            }
        }
        //if(is_update){EqApp.tasks_data.set(tasks);}
    };

    /* --------------------------------------- */
    /* Count
    /* --------------------------------------- */
    _this.count = function () {
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
    /* Complete count
    /* --------------------------------------- */
    _this.complete_count = function () {
        var _items = EqApp.tasks_data.get();
        var _items_new = [];
        for(var key in _items) {
            if (_items[key].complete === true) {
                _items_new.push(_items[key]);
            }
        }
        return _items_new.length;
    };

    /* --------------------------------------- */
    /* Helps
    /* --------------------------------------- */

    // Parse url
    _this.parse_url = function(object) {
        var _url = Meteor.settings.public.rootPath;
        var _link = object.link.replace(new RegExp('&#x2F;', 'g'), "/").replace(new RegExp('&amp;', 'g'), "&");

        // Is board
        if(_link.indexOf("/boards")===0){
            _link = "/emawrap?path="+_link.substring(1,_link.length);
        }

        _url += '/manager' + _link + '&menu=projects-manage';

        return _url;
    };

    // Avatar
    _this.avatar = function(username) {
        return "http://www.exentriq.com/AvatarService?username=" + username;
    };

    /* --------------------------------------- */
    /* WS Helps
    /* --------------------------------------- */

    // Get all
    _this.ws_get_all = function (callback) {
        // List all
        Meteor.call('tasks.get_all', EqApp.client.site.username(),
        function(error, result){
            if($.isFunction(callback)){callback(result, error);}
        });
    };

    // WS Update all
    _this.ws_update_all = function () {
        if(EqApp.client.site.username()===null){return;}

        // List all
        _this.ws_get_all(function(result, error){
            if(result){
                _this.update_all(result);
            } else if (error){
                console.log('error:', error);
            }
        });
    };

    // Add
    _this.ws_add = function (callback, data) {
        Meteor.call('tasks.add', data,
        function(error, result){
            if($.isFunction(callback)){callback(result, error);}
        });
    };

    // Open
    _this.ws_open = function (callback, data) {
        Meteor.call('tasks.open', data,
        function(error, result){
            if($.isFunction(callback)){callback(result, error);}
        });
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
        // ...
    };

    // Meteor startup
    mtr.startup(function () {
        // Init
        _this.mtr_init();
    });

}( Meteor, jQuery ));