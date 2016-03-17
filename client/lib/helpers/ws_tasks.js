// Set start point
if(!EqApp.client){EqApp.client = {};}
var _start_point = EqApp.client;

// Client -> tasks
(function (mtr, $) {
    _start_point.tasks = {};
    var _this = function(){return _start_point.tasks;}();

    _this.window_load = false;

    _this.username = null;

    /* --------------------------------------- */
    /* Build
    /* --------------------------------------- */
    _this.build = function (task) {
        var link = _this.parse_url(task);
        var assigned_to = [];

        // Build avatars
        task.content.users.forEach(function(user){
            assigned_to.push({avatar:_this.avatar(user)});
        });

        //console.log('task', task);

        // Build task
        return {
            "id": task.id,
            "subject": task.content.clean,
            "action": link,
            "points": task.content.points,
            "effort": task.content.days,
            "project": task.boardTitle,
            "eta": task.content.eta,
            "milestone": task.content.milestone,
            "assigned_to": assigned_to,
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
        Meteor.call('tasks.get_all', _this.username,
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

        if(!_this.username){return;}

        // List all
        _this.ws_get_all(function(result, error){
            if(result){
                _this.update_all(result);
            } else if (error){
                console.log('error:', error);
            }
        });
    };

    // Meteor startup
    mtr.startup(function () {
        // Init
        _this.mtr_init();
    });

}( Meteor, jQuery ));