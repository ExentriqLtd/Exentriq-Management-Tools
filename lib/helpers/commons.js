// Set start point
if(!EqApp.lib){EqApp.lib = {};}
var _start_point = EqApp.lib;

// Client -> site
(function (mtr) {
    _start_point.common = {};
    var _this = function(){return _start_point.common;}();
    
    /* --------------------------------------- */
    /* Avatar
    /* --------------------------------------- */
    _this.avatar = function(username) {
        return "http://www.exentriq.com/AvatarService?username=" + username;
    };

    /* --------------------------------------- */
    /* GUID
    /* --------------------------------------- */
    _this.guid = function() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
    };
    
    // Meteor Init
    _this.mtr_init = function() {
        //...
    };

    // Meteor startup
    mtr.startup(function () {
        // Init
        _this.mtr_init();
    });

}( Meteor ));
