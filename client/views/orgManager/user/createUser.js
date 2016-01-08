'use strict';

Template.createUserDialog.events({
	'click #create_user_submit': function() {

		var userName = $('#create_user_username').val();
		if (userName) {
			Template.orgManager.insertSpace({
				name: userName,
				parent: Template.treeView.selectedNode ? Template.treeView.selectedNode._id : null,
				cmpId: Template.orgManager._cmpId,
				type: 'user'
			});

			$('#create_user_username').val('');
		}
	}
});