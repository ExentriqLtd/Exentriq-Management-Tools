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
    // Avatar
    _this.avatar = function(username) {
        return "http://www.exentriq.com/AvatarService?username=" + username;
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
