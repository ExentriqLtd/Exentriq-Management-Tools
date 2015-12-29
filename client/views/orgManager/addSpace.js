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
				Template.mainView._cmpId, // company name
				$('input.eq-ui-space-search').val() || '', // search terms
					function(error, data) { // callback

					if (error){
						Session.set('spaces', []);
					}
					else {

						var existingSpaces = Spaces.find({cmpId: Template.mainView._cmpId}).fetch();
						var s = data.filter(function(i){
							return !existingSpaces.some(function(o){  return o.id == i.id; });
						});
						Session.set('spaces', s);
					}
			});
		}
	},
	// click on space
	'click .space-item': function(){
		var space = this;
		$("[itemId="+ space.id +"]").remove();
		Template.mainView.insertSpace($.extend(space, {
			parent: null,
			cmpId: Template.mainView._cmpId,
			type: 'space'
		}));
	}
});