//---------------------------------------------------
//  Missions Modal Add
//---------------------------------------------------

// Rendered
Template.missions_modal_add.onRendered(function(){
    //console.log('modal missions rendered...');

    // Change body ref for overlay parent
    EqUI.site.body = $('#__blaze-root');

    $('#eq-man-missions-modal-add').openModal({
        complete: on_close_modal,
        ready: on_open_modal
    });

});

// Helps
Template.missions_modal_add.helpers({
    autocompleteSettings: function() {
        return EqApp.notifications.autocompleteSettings();
    }
});

// Events
Template.missions_modal_add.events({
    "click #add-mission-action, submit #form-mission-add": function(event, template) {
        event.preventDefault();
        var statementEml = template.find('#statement-eml').value;
        
        var obj = Eml.parse(statementEml);
        if(!obj.project){
            EqApp.client.site.toast.error('The project is mandatory. Type something like this: #project @user1 mission description.');
        }
        else if(!obj.users || obj.users.length==0){
            EqApp.client.site.toast.error('The user is mandatory. Type something like this: #project @user1 mission description.');
        }
        else{
            EqApp.client.missions.add(statementEml);
            
            // Close
            $('#eq-man-missions-modal-add').closeModal({
                complete: on_close_modal
            });
        }
    },
    "autocompleteselect input": function(event, template, doc) {
        EqApp.notifications.autocompleteReplace(event, template, doc, '#statement-eml');
    }
});

// COMMONS
var on_close_modal = function(){
    //console.log('close modal...');
    Session.set("missionsShowModalAdd", false);
};

var on_open_modal = function(){
    //console.log('open modal...');
    // Rollback to body
    EqUI.site.body = $('body');
    // Focus
    $('#eq-man-missions-modal-add .eq-man-autocomplete input').focus();
};
