'use strict';

Template.createSpaceDialog.events({
	'click #create_space_submit': function() {

		var spaceName = $('#create_space_name').val();
		if (spaceName) {
			Template.orgManager.insertSpace({
				name: spaceName,
				parent: Template.treeView.selectedNode ? Template.treeView.selectedNode._id : null,
				cmpId: Template.orgManager._cmpId,
				type: 'space'
			});

			$('#create_space_name').val('');
		}
	}
});

Template.createSpaceDialog.helpers({
	autocompleteSettings: function() {
	    return {
	      position: "bottom",
	      limit: 20,
	      rules: [
	        {
	          token: '#',
	          collection: Boards,
	          field: "title",
	          template: Template.boardPill
	        }
	      ]
	    };
	  }
});

Template.createSpaceDialog.events({
	'click #statement-add': function() {

		var spaceName = $('#statement-eml-space').val().replace('@', '').trim();
		if (spaceName) {
			Template.orgManager.insertSpace({
				name: spaceName,
				parent: Template.treeView.selectedNode ? Template.treeView.selectedNode._id : null,
				cmpId: Template.orgManager._cmpId,
				type: 'space'
			});
		}
		$('#statement-eml-space').val('');
	}
});

Template.createSpaceDialog.rendered = function() {
	$('#statement-eml').attr('autocomplete', 'off');
};