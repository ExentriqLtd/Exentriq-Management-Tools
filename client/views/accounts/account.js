// Created
Template.account.onCreated(function () {

});

// Destroyed
Template.account.onDestroyed(function(){
    // Clear
    EqApp.client.site.toast.clear();
});

// Rendered
Template.account.onRendered(function(){
    // Init Waves
    Waves.attach('.eq-ui-waves', ['waves-effect']);
    Waves.attach('.eq-ui-waves-light', ['waves-effect', 'waves-light']);
});

// HELPERS
Template.account.helpers({

});

// EVENTS
Template.account.events({
    'click #log-out-action' : function(e, t){
        event.preventDefault();

        // TODO Calogero, integrate wiht the actual login paradigm

        // Fake log out
        localStorage.setItem('MeteorLoginSessionToken', "");
        localStorage.setItem("MeteorLastSessionToken", "");
        Meteor.logout();

        // Go to root app
        FlowRouter.go('/login');
    }
});
