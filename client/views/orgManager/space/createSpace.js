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