// Created
Template.login.onCreated(function () {
    Session.setDefault("mtoolsLoginStatus", 'halted');
});

// Destroyed
Template.login.onDestroyed(function(){
    // Clear
    EqApp.client.site.toast.clear();
});

// Rendered
Template.login.onRendered(function(){
    // Init Waves
    Waves.attach('.eq-ui-waves', ['waves-effect']);
    Waves.attach('.eq-ui-waves-light', ['waves-effect', 'waves-light']);
});

// HELPERS
Template.login.helpers({
    is_disabled_login_bt: function () {
        return Session.get("mtoolsLoginStatus") !== 'halted';
    }
});

// EVENTS
Template.login.events({
    'click #login-form-submit, submit #login-form' : function(e, t){
        event.preventDefault();
        // Get data
        var username = t.find('#username').value;
        var password = t.find('#password').value;

        // Validate
        if(!EqUI.forms.validate_form($('#login-form'))){return false;}

        Session.set("mtoolsLoginStatus",  'in-progress');

        // Login
        Meteor.call('loginPlatformUser', username, password, function(error, result){
            Session.set("mtoolsLoginStatus",  'halted');
            ExPush.register(username);
            if(result){
                // Set login token
                localStorage.setItem('MeteorLoginSessionToken', result.sessionToken);

                // Go to root app
                FlowRouter.go('/');
            } else {
                EqApp.client.site.toast.error('Invalid username or password');
            }
        });
    }
});
