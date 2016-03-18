// Set start point
if(!EqApp.client){EqApp.client = {};}
var _start_point = EqApp.client;

// Client -> missions
(function (mtr, $) {
    _start_point.missions = {};
    var _this = function(){return _start_point.missions;}();

    _this.window_load = false;

    /* --------------------------------------- */
    /* Build
    /* --------------------------------------- */
    _this.build = function (mission) {
        //var link = _this.parse_url(mission);
        var assigned_to = [];

        // Build avatars
        mission.content.users.forEach(function(user){
            assigned_to.push({avatar:_this.avatar(user)});
        });

        //console.log('mission', mission);

        // Build mission
        return {
            "id": mission.id,
            "subject": mission.content.clean || '&nbsp;',

            "points": mission.content.points,

            "assigned_to": assigned_to,

            "effort": mission.content.days,
            "eta": mission.content.eta,
            "closed_on": mission.content.closed_on || 'Not Closed',

            "milestone": mission.content.milestone,
            "project": mission.boardTitle || '&nbsp;',
            "card": mission.content.card || '&nbsp;',

            "progress": mission.content.progress,

            "complete": mission.status
        };
    };

    /* --------------------------------------- */
    /* Update all
    /* --------------------------------------- */
    _this.update_all = function (data) {

        var missions = [];

        // Build array
        data.result.forEach(function(mission){
            var item = _this.build(mission);
            if(item){ missions.push(item); } // Add
        });

        //console.log('missions', missions);

        // Set react var
        EqApp.missions_data.set(missions);
    };

    /* --------------------------------------- */
    /* Set complete
    /* --------------------------------------- */
    _this.set_complete = function (id, value) {

        // Send to ws
        //_this.ws_set_complete_by_id(id);

        // Update UI
        var missions = EqApp.missions_data.get();
        var is_update = false;
        for (var key in missions) {
            if (missions[key].id === id) {
                missions[key].complete = value;
                is_update = true;
            }
        }
        if(is_update){EqApp.missions_data.set(missions);}
    };

    /* --------------------------------------- */
    /* Set all complete
    /* --------------------------------------- */
    _this.set_all_complete = function () {

        // Update UI
        var missions = EqApp.missions_data.get();
        var is_update = false;
        for (var key in missions) {
            var _item = missions[key];
            if (_item.complete === false) {
                // Send to ws
                //_this.ws_set_complete_by_id(_item.id);

                missions[key].complete = true;
                is_update = true;
            }
        }
        if(is_update){EqApp.missions_data.set(missions);}
    };

    /* --------------------------------------- */
    /* Count
    /* --------------------------------------- */
    _this.count = function () {
        var _items = EqApp.missions_data.get();
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
        var _items = EqApp.missions_data.get();
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
    /*_this.parse_url = function(object) {
        var _url = Meteor.settings.public.rootPath;
        var _link = object.link.replace(new RegExp('&#x2F;', 'g'), "/").replace(new RegExp('&amp;', 'g'), "&");

        // Is board
        if(_link.indexOf("/boards")===0){
            _link = "/emawrap?path="+_link.substring(1,_link.length);
        }

        _url += '/manager' + _link + '&menu=projects-manage';

        return _url;
    };*/

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
        Meteor.call('missions.get_all', EqApp.client.site.username(),
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
