'use strict';

Template.addUserDialog.helpers({
	users: function() {
		return Session.get('users') || [];
	}
});

Template.addUserDialog.events({
	// find a user
	'keyup .eq-ui-user-search': function(e) {

		if (e.keyCode == '13') {
			Meteor.call('getUsers', Template.mainView._cmpId, function(error, data) {

				if (error) {
					Session.set('users', []);
				} else {
					Session.set('users', data.list.list);
				}
			});
		}
	},
	// click on user
	'click .user-item': function(){
		var space = this;
		var _id = Spaces.insert({
			cmpId: Template.mainView._cmpId,
			type: 'user',
			name: space.name,
			parent: null
		});
	}
});