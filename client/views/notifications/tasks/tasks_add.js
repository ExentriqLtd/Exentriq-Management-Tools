//---------------------------------------------------
//  Tasks Modal Add
//---------------------------------------------------

// Rendered
Template.tasks_modal_add.onRendered(function(){
    //console.log('modal tasks rendered...');

    // Change body ref for overlay parent
    EqUI.site.body = $('#__blaze-root');

    $('#eq-man-tasks-modal-add').openModal({
        complete: function() {
            //console.log('close modal...');
            Session.set("tasksShowModalAdd", false);
        },
        ready: function() {
            //console.log('open modal...');
            // Rollback to body
            EqUI.site.body = $('body');
            // Focus
            $('#eq-man-tasks-modal-add .eq-man-autocomplete input').focus();
        }
    });

});

// Helps
Template.tasks_modal_add.helpers({
    autocompleteSettings: function() {
        return EqApp.notifications.autocompleteSettings();
    }
});

// Events
Template.tasks_modal_add.events({
    "click #add-task-action": function(event, template) {
        event.preventDefault();
        var statementEml = template.find('#statement-eml').value;
        EqApp.client.tasks.add(statementEml);
    },
    "autocompleteselect input": function(event, template, doc) {
        EqApp.notifications.autocompleteReplace(event, template, doc, '#statement-eml');
    }
});
