'use strict';

Template.createUserDialog.events({
	'click #create_user_submit': function(){

		Template.mainView.insertSpace({
			name: $('#create_user_username').val(),
			parent: Template.treeView.selectedNode ? Template.treeView.selectedNode._id : null ,
			cmpId: Template.mainView._cmpId,
			type: 'user'
		});

		$('#create_user_username').val('')
	}
});