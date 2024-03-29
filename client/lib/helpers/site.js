// Set start point
if(!EqApp.client){EqApp.client = {};}
var _start_point = EqApp.client;

// Client -> site
(function (mtr, $) {
    _start_point.site = {};
    var _this = function(){return _start_point.site;}();

    _this.window_load = false;

    /* --------------------------------------- */
    /* Is Cordova
    /* --------------------------------------- */
    _this.is_cordova = function () {
        var _is_cordova = Meteor.isCordova;

        // Debug
        if(Meteor.settings.public.isDebug){
            // Simulate
            if(_is_cordova === false){
                _is_cordova = Meteor.settings.public.simulateCordova;
            }
            
            // Get Query
            var query_string = EqUI.site.query_string;

            // Is username
            if(query_string.debugCordova !== undefined) {
                _is_cordova = query_string.debugCordova === 'true';
            }
        }

        return _is_cordova;
    };

    /* --------------------------------------- */
    /* Username
    /* --------------------------------------- */
    _this.username = function () {
        var username = null;

        // Get username
        if(Meteor.user() && Meteor.user().username){
            username = Meteor.user().username;
        }

        // Debug
        if(Meteor.settings.public.isDebug){
            // Get Query
            var query_string = EqUI.site.query_string;

            // Is username
            if(query_string.debugUsername !== undefined) {
                username = query_string.debugUsername;
            }
        }

        return username;
    };

    /* --------------------------------------- */
    /* User details
    /* --------------------------------------- */
    _this.user_details = function (id) {
        if(!Meteor.user()){return {};}

        var address = '';
        if(Meteor.user().emails && Meteor.user().emails.length){
            address = Meteor.user().emails[0].address;
        }

        return {avatar: EqApp.lib.common.avatar(_this.username()), username: _this.username(), email: address};
    };
    
    /* --------------------------------------- */
    /* Channel Url
    /* --------------------------------------- */
    _this.channel_url = function () {
        var channel = Meteor.settings.public.rootPath;
        
        // Get Query
        var query_string = EqUI.site.query_string;
        
        // Is channelUrl
        if(query_string.channelUrl !== undefined) {
            channel = query_string.channelUrl;
        }
        
        return channel;
    };
    
    /* --------------------------------------- */
    /* Space
    /* --------------------------------------- */
    _this.space = function () {
        var space = null;
        
        // Get Query
        var query_string = EqUI.site.query_string;

        // Is spaceid
        if(query_string.spaceid !== undefined) {
            space = query_string.spaceid;
        }
        
        return space;
    };

    /* --------------------------------------- */
    /* User language
    /* --------------------------------------- */
    _this.user_language = function () {
        // TODO - Get language by user in DB
        return 'en';
    };

    /* --------------------------------------- */
    /* Set app language
    /* --------------------------------------- */
    _this.set_app_language = function (lang_def) {
        _this.loading(true);

        var lang = _this.user_language() || lang_def;

        // Set user language
        TAPi18n.setLanguage(lang)
        .done(function () {
            _this.loading(false);
        })
        .fail(function (error) {
            // Handle the situation
            console.log(error);
        });
    };

    /* --------------------------------------- */
    /* Loading
    /* --------------------------------------- */
    _this.loading = function(show) {
        if(show){
            $('.container-loading-indicator').fadeIn();
        } else {
            $('.container-loading-indicator').fadeOut();
        }
    };

    /* --------------------------------------- */
    /* Toast Wrapper
    /* --------------------------------------- */
    _this.toast = toastr;

    // Device ready
    _this.deviceready = function() {
        //console.log('device ready...');
        window.open = cordova.InAppBrowser.open;

        if (device.platform.toUpperCase() === 'ANDROID') {

        }
        else if (device.platform.toUpperCase() === 'IOS') {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            //cordova.plugins.Keyboard.disableScroll(true);
        }
        else {
            // ...
        }
    };

    // Init
    _this.init = function() {
        // ...
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
        //...
    };

    // Meteor startup
    mtr.startup(function () {
        // Init
        _this.mtr_init();
    });

    // Device ready
    if(Meteor.isCordova){
        document.addEventListener("deviceready", function () {
            _this.deviceready();
        }, false);
    }

}( Meteor, jQuery ));
