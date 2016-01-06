'use strict';

Template.addSpaceDialog.helpers({
	spaces: function() {
		return Session.get('spaces') || [];
	}
});

Template.addSpaceDialog._timeOut = null;

Template.addSpaceDialog.events({
	'click .eq-ui-modal-close': function() {
		Session.set('spaces', []);
		$('input.eq-ui-space-search').val('');
	},
	'keyup .eq-ui-space-search': function(e) {

		clearTimeout(Template.addSpaceDialog._timeOut);
		if (e.keyCode == '13') {
			runSearch();
		}
		Template.addSpaceDialog._timeOut = setTimeout(runSearch, 250);

		function runSearch() {

			/*Meteor.call(
				'getSpaces', // methode
				Template.orgManager._cmpId, // company name
				$('input.eq-ui-space-search').val() || '', // search terms
				function(error, data) { // callback

					if (error) {
						Session.set('spaces', []);
					} else {
						Session.set('spaces', Template.addSpaceDialog.filter(data));
					}
				});*/
		}
	},
	// click on space
	'click .space-item': function(e) {
		var space = this;
		Template.orgManager.insertSpace($.extend(space, {
			parent: Template.treeView.selectedNode ? Template.treeView.selectedNode._id : null ,
			cmpId: Template.orgManager._cmpId,
			type: 'space'
		}));
		Session.set('spaces', Template.addSpaceDialog.filter(Session.get('spaces')));
	}
});

Template.addSpaceDialog.filter = function(items) {

	var existingSpaces = Spaces.find({ type: 'space', cmpId: Template.orgManager._cmpId }).fetch();
	var data = items.filter(function(i) {
		return !existingSpaces.some(function(o) {
			return o.id == i.id;
		});
	});
	return data;
};

Template.addSpaceDialog.rendered = function() {
	Session.set('spaces', []);
	$('input.eq-ui-space-search').val('');
};