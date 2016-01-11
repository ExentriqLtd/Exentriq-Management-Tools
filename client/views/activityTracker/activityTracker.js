
// sprintPlanner template
Template.activityTracker.render = function(_param) {
	Meteor.subscribe("activities")
}

Template.activityTracker.onCreated(function() {
	
});

Template.activityTracker.helpers({
	activities: function() {
		var activities = Activities.find();
		return activities;
	}
});

Template.activityTracker.events({
	'click #statement-add': function(evt, tpl) {
		evt.preventDefault();
	
		var username = Session.get('username');
		var space = Session.get('space');
		var statementEml = tpl.find('#statement-eml').value;

		Meteor.call('addActivityEml', statementEml, username, space);
	}
});

Template.activityTracker.rendered = function() {
	// Modal configuration
	$('.eq-ui-modal-trigger').leanModal({
		dismissible: true,
		opacity: .5,
		in_duration: 300,
		out_duration: 200,
		ready: function() {},
		complete: function() {}
	});

	$('.dropdown-trigger').dropdown({
		inDuration: 300,
		outDuration: 225,
		hover: true,
		gutter: 0,
		belowOrigin: false
	});
};

//atActivity template
Template.atActivity.onRendered(function() {
	$('.dropdown-trigger').dropdown({
		inDuration: 300,
		outDuration: 225,
		hover: true,
		gutter: 0,
		belowOrigin: false
	});
});

Template.atActivity.events({

	'click .eml-delete': function(evt, tpl) {
		Session.set('selectedActivity', this);
		$('#eq-ui-modal-delete').openModal();
	}

});

//deleteActivityEml template
Template.deleteActivityEml.events({
	'click #statement-delete': function(evt, tpl) {

		var selectedActivity = Session.get('selectedActivity');
		Activities.remove(selectedActivity._id);
	}
});