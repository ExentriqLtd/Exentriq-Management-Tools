// Set start point
if(!EqApp.client){EqApp.client = {};}
var _start_point = EqApp.client;

// Client -> site
(function (mtr, $) {
    _start_point.site = {};
    var _this = function(){return _start_point.site;}();

    _this.window_load = false;

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
        //...
    };

    // Meteor startup
    mtr.startup(function () {
        // Init
        _this.mtr_init();
    });

}( Meteor, jQuery ));