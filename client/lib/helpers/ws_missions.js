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
    /* Get all
    /* --------------------------------------- */
    _this.all = function (type) {
        var filter = {};
        if(type==='open'){
            filter.closed_on={$in:[null, '']};
        }
        else if(type==='closed'){
            filter.closed_on={$not:{$in:[null, '']}};
        }
        return NotifyMissions.find(filter, {sort: {points: -1}});
    };

    /* --------------------------------------- */
    /* Add
    /* --------------------------------------- */
    _this.add = function (statementEml) {
        
        if(statementEml === ''){return;}
        
        // Data
        var data = {
            username: EqApp.client.site.username(),
            message: statementEml
        };

        // WS Add
        _this.ws_add(function(result, error){
            _this.updateCollection();
            if(result){
                if(result.status === 'fail'){
                    console.log('error:', result.message);
                    EqApp.client.site.toast.error('Error for Create Mission: ' + result.message);
                } else {
                    //console.log('add', result);
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
    _this.set_complete = function (id, value, update_collection) {
        var _update_collection = _.isUndefined(update_collection) ? true:update_collection;

        // Data
        var data = {
            id: id,
            open: !value === true ? "true":"false"
        };

        // Update UI
        var doc = NotifyMissions.findOne({id:data.id});
        var d = new Date();
        var closed_on = null;
        if(data.open === 'false'){
            closed_on = d.toISOString();
        }
        doc.closed_on = closed_on;
        doc.complete = value;

        // WS Open
        _this.ws_open(function(result, error){
            if(_update_collection){
                _this.updateCollection();
            }
            if(result){
                if(result.status === 'fail'){
                    console.log('error:', result.error);
                } else {
                    //console.log('success:', result);
                }
            } else if (error){
                console.log('error:', error);
            }
        }, data, doc);
    };

    /* --------------------------------------- */
    /* Set all complete
    /* --------------------------------------- */
    _this.set_all_complete = function () {
        var open = _this.all('open').fetch();
        var count = _this.count();
        open.forEach(function(item){
            count--;
            if(count <= 0){
                _this.set_complete(item.id, true, true);
            } else {
                _this.set_complete(item.id, true, false);
            }
        });
    };

    /* --------------------------------------- */
    /* Count
    /* --------------------------------------- */
    _this.count = function () {
        return _this.all('open').count();
    };

    /* --------------------------------------- */
    /* Complete count
    /* --------------------------------------- */
    _this.complete_count = function () {
        return _this.all('closed').count();
    };

    /* --------------------------------------- */
    /* Helps
    /* --------------------------------------- */

    // ...

    /* --------------------------------------- */
    /* WS Helps
    /* --------------------------------------- */

    // Add
    _this.ws_add = function (callback, data) {
        Meteor.call('missions.add', data,
        function(error, result){
            if($.isFunction(callback)){callback(result, error);}
        });
    };

    // Open
    _this.ws_open = function (callback, data, doc) {
        Meteor.call('missions.open', data, doc,
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
