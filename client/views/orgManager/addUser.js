'use strict';

Template.addUserDialog.helpers({
	users: function() {
		return Session.get('users') || [];
	}
});

Template.addUserDialog._timeOut = null;

Template.addUserDialog.events({
	'click .eq-ui-modal-add-spaces': function(){
		//$('.eq-ui-modal-overlay').remove();
	},
	// find a user
	'keyup .eq-ui-user-search': function(e) {

		clearTimeout(Template.addUserDialog._timeOut);
		if (e.keyCode == '13') {
			runSearch();
		}
		Template.addSpaceDialog._timeOut = setTimeout(runSearch, 250);

		function runSearch() {
			Meteor.call(
				'getUsers', // methode
				Template.mainView._cmpId, // company name
				$('input.eq-ui-user-search').val() || '', // search terms
				function(error, data) { // callback

					if (error) {
						Session.set('users', []);
					} else {

						var existingSpaces = Spaces.find({
							cmpId: Template.mainView._cmpId
						}).fetch();
						var s = data.filter(function(i) {
							return !existingSpaces.some(function(o) {
								return o.id == i.id;
							});
						});
						Session.set('users', s);
					}
				});
		}
	},
	// click on user
	'click .user-item': function() {
		var user = this;
		$("[itemId=" + user.id + "]").remove();
		Template.mainView.insertSpace($.extend(user, {
			parent: null,
			cmpId: Template.mainView._cmpId,
			type: 'user'
		}));
	}
});

Template.addUserDialog.rendered = function() {
	Session.set('users', []);
	$('input.eq-ui-user-search').val('');
};