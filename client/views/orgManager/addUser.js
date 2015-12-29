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
			Meteor.call(
				'getUsers', // methode
				Template.mainView._cmpId, // company name
				$('input.eq-ui-user-search').val() || '', // search terms
					function(error, data) { // callback

					if (error){
						Session.set('users', []);
					}
					else {

						var existingSpaces = Spaces.find({cmpId: Template.mainView._cmpId}).fetch();
						data.list.list.filter(function(i){
							return !existingSpaces.some(function(o){ return o.spaceId == i.spaceId; });
						});
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