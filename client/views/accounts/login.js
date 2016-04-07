// Created
Template.login.onCreated(function () {

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

        // TODO Calogero, integrate wiht the actual login paradigm
        
        // Login
        console.log('login:', username, password);
        
        // Fake login
        localStorage.setItem('MeteorLoginSessionToken', "1459875834346698");
        
        // Go to root app
        FlowRouter.go('/');
    }
});
