//---------------------------------------------------
//  Missions Modal Add
//---------------------------------------------------

// Rendered
Template.missions_modal_add.onRendered(function(){
    //console.log('modal missions rendered...');

    // Change body ref for overlay parent
    EqUI.site.body = $('#__blaze-root');

    $('#eq-man-missions-modal-add').openModal({
        complete: function() {
            //console.log('close modal...');
            Session.set("missionsShowModalAdd", false);
        },
        ready: function() {
            //console.log('open modal...');
            // Rollback to body
            EqUI.site.body = $('body');
            // Focus
            $('#eq-man-missions-modal-add .eq-man-autocomplete input').focus();
        }
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
    "click #add-mission-action": function(event, template) {
        event.preventDefault();
        var statementEml = template.find('#statement-eml').value;
        EqApp.client.missions.add(statementEml);
    },
    "autocompleteselect input": function(event, template, doc) {
        EqApp.notifications.autocompleteReplace(event, template, doc, '#statement-eml');
    }
});
