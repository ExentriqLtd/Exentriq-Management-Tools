'use strict';

Template.createSpaceDialog.events({
	'click #create_space_submit': function(){

		Template.mainView.insertSpace({
			name: $('#create_space_name').val(),
			parent: Template.treeView.selectedNode ? Template.treeView.selectedNode._id : null ,
			cmpId: Template.mainView._cmpId,
			type: 'space'
		});

		$('#create_space_name').val('');
	}
});