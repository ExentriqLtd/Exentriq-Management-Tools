'use strict';

Template.createUserDialog.helpers({
	autocompleteSettings: function() {
	    return {
	      position: "bottom",
	      limit: 20,
	      rules: [
	        {
	          token: '',
	          collection: AppUsers,
	          field: "username",
	          template: Template.userPill
	        }
	      ]
	    };
	  }
});

Template.createUserDialog.events({
	'click #statement-add': function() {

		var userName = $('#statement-eml-user').val();
		if (userName) {
			Template.orgManager.insertSpace({
				name: userName,
				parent: Template.treeView.selectedNode ? Template.treeView.selectedNode._id : null,
				cmpId: Template.orgManager._cmpId,
				type: 'user'
			});
		}
		$('#statement-eml-user').val('');
	}
});

Template.createUserDialog.rendered = function() {
	$('#statement-eml-user').attr('autocomplete', 'off');
};