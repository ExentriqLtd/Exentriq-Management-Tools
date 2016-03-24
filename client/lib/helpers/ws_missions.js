// Set start point
if(!EqApp.client){EqApp.client = {};}
var _start_point = EqApp.client;

// Client -> missions
(function (mtr, $) {
    _start_point.missions = {};
    var _this = function(){return _start_point.missions;}();

    _this.window_load = false;

    /* --------------------------------------- */
    /* Update Collection
    /* --------------------------------------- */
    _this.updateCollection = function () {
        Session.set("missionsUpdatedNum", Session.get("missionsUpdatedNum")+1);
    };

    /* --------------------------------------- */
    /* Build
    /* --------------------------------------- */
    _this.build = function (mission) {
        //var link = _this.parse_url(mission);
        var assigned_from = [];
        var assigned_to = [];

        // Avatar from
        if(mission.content.author){
            assigned_from.push({avatar:_this.avatar(mission.content.author)});
        }

        // Build avatars
        mission.content.users.forEach(function(user){
            assigned_to.push({avatar:_this.avatar(user)});
        });

        //console.log('mission', mission);

        // Build mission
        return {
            "id": mission.id,
            "subject": mission.content.clean || '&nbsp;',

            "points": mission.content.points || 0,

            "assigned_from": assigned_from,
            "assigned_to": assigned_to,

            "effort": mission.content.days || 0,
            "eta": mission.content.eta || '',
            "closed_on": mission.content.closed_on || null,

            "milestone": mission.content.milestone || '',
            "project": mission.boardTitle || '',
            "card": mission.content.card || '',

            "progress": mission.content.progress || 0,

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
    /* Add
    /* --------------------------------------- */
    _this.add = function (statementEml) {

        // Data
        var data = {
            username: EqApp.client.site.username(),
            message: statementEml
        };

        // WS Add
        _this.ws_add(function(result, error){
            if(result){
                if(result.status === 'fail'){
                    console.log('error:', result.error);
                    EqApp.client.site.toast.error('Error for Create Mission: ' + result.error);
                } else {
                    //console.log('add', result);
                    //_this.ws_update_all();
                    _this.updateCollection();
                    EqApp.client.site.toast.success("Create Mission Successfully");
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

        // Update UI
        /*var missions = EqApp.missions_data.get();
        var is_update = false;
        var key_update = null;
        for (var key in missions) {
            if (missions[key].id === id) {
                missions[key].complete = value;
                key_update = key;
                is_update = true;
            }
        }
        if(is_update){EqApp.missions_data.set(missions);}*/

        // WS Open
        _this.ws_open(function(result, error){
            if(result){
                if(result.status === 'fail'){
                    console.log('error:', result.error);
                } else {
                    _this.updateCollection();
                    //console.log('success:', result);
                    // Update UI
                    /*if(key_update && result.data){
                        var missions = EqApp.missions_data.get();
                        missions[key_update].closed_on = result.data.closed_on || null;
                        EqApp.missions_data.set(missions);
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
        var missions = EqApp.missions_data.get();
        //var is_update = false;
        for (var key in missions) {
            var _item = missions[key];
            if (_item.complete === false) {
                _this.set_complete(missions[key].id, true);

                // Send to ws
                //_this.ws_set_complete_by_id(_item.id);

                //missions[key].complete = true;
                //is_update = true;
            }
        }
        //if(is_update){EqApp.missions_data.set(missions);}
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

    // Add
    _this.ws_add = function (callback, data) {
        Meteor.call('missions.add', data,
        function(error, result){
            if($.isFunction(callback)){callback(result, error);}
        });
    };

    // Open
    _this.ws_open = function (callback, data) {
        Meteor.call('missions.open', data,
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
