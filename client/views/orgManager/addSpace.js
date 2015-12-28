'use strict';

Template.addSpaceDialog.helpers({
	spaces: function() {
		return Session.get('spaces') || [];
	}
});

Template.addSpaceDialog.events({
	'keyup .eq-ui-space-search': function(e) {

		if (e.keyCode == '13') {
			Meteor.call(
				'getSpaces', // methode
				$('input.eq-ui-space-search').val() || 'ALL', // search terms
				Template.mainView._cmpId, // company name
					function(error, data) { // callback

					if (error){
						Session.set('spaces', []);
					}
					else {
						Session.set('spaces', data.list.list);
					}
			});
		}
	},
	// click on space
	'click .space-item': function(){
		var space = this;
		var _id = Spaces.insert({
			cmpId: Template.mainView._cmpId,
			type: 'space',
			name: space.name,
			parent: null
		});
	}
	// Create new Space
	/*'click #create_space_submit': function() {

		$('#create-space').closeModal();
		var newSpaceForm = $('#eq-ui-modal-create-space-form');
		var spaceName = newSpaceForm.find('#create_space_name').val();
		newSpaceForm.find('#create_space_name').val('')

		var _id = Spaces.insert({
			cmpId: Template.mainView._cmpId,
			type: 'space',
			name: spaceName,
			parent: null
		});
	},
	// Create new User
	'click #create_user_submit': function() {

		$('#create-user').closeModal();
		var newUserForm = $('#eq-ui-modal-create-user-form');

		var newUser = {
			cmpId: Template.mainView._cmpId,
			type: 'user',
			name: newUserForm.find('#create_user_username').val(),
			email: newUserForm.find('#create_user_email').val(),
			password: newUserForm.find('#create_user_password').val(),
		};

		var _id = Spaces.insert(newUser);
	},*/
});