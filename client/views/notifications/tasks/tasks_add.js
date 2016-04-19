//---------------------------------------------------
//  Tasks Modal Add
//---------------------------------------------------

// Rendered
Template.tasks_modal_add.onRendered(function(){
    //console.log('modal tasks rendered...');

    // Change body ref for overlay parent
    EqUI.site.body = $('#__blaze-root');

    $('#eq-man-tasks-modal-add').openModal({
        complete: on_close_modal,
        ready: on_open_modal
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
    "click #add-task-action, submit #form-tasks-add": function(event, template) {
        event.preventDefault();
        var statementEml = template.find('#statement-eml').value;
        
        var obj = Eml.parse(statementEml);
        if(!obj.project){
            EqApp.client.site.toast.error('The project is mandatory. Type something like this: #project task description.');
        }
        else{
            EqApp.client.tasks.add(statementEml);

            // Close
            $('#eq-man-tasks-modal-add').closeModal({
                complete: on_close_modal
            });

        }
        
    },
    "autocompleteselect textarea": function(event, template, doc) {
        EqApp.notifications.autocompleteReplace(event, template, doc, '#statement-eml');
    }
});

// COMMONS
var on_close_modal = function(){
    //console.log('close modal...');
    Session.set("tasksShowModalAdd", false);
};

var on_open_modal = function(){
    //console.log('open modal...');
    // Rollback to body
    EqUI.site.body = $('body');

    // Textarea auto size
    autosize($('#eq-man-tasks-modal-add textarea.eq-ui-textarea'));

    // Focus
    $('#eq-man-tasks-modal-add .eq-man-autocomplete textarea').focus();
};
