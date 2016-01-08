
// sprintPlanner template
Template.activityTracker.render = function(_param) {
	var param = $.extend({
		cmpId: ''
	}, _param);

	var cmpId = param.cmpId;
	Template.activityTracker._cmpId = cmpId;
}

Template.activityTracker.onCreated(function() {
	var username = 'calogero.crapanzano';
	var space = Template.activityTracker._cmpId;
	
	Meteor.subscribe("activities", space);
	Session.set('username', username);
	Session.set('space', space);
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

	Template.sprintPlanner.renderDone = true;
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

Template.registerHelper('formatDate', function(date) {
  return moment(date).format('DD-MM-YYYY');
});
Template.registerHelper('formatSeconds', function(seconds) {
	var numdays = Math.floor(seconds / 28800);
	var numhours = Math.floor((seconds % 28800) / 3600);
	var numminutes = Math.floor(((seconds % 28800) % 3600) / 60);
	var numseconds = ((seconds % 28800) % 3600) % 60;
	return numdays + " days " + numhours + " hours " + numminutes + " minutes " + numseconds + " seconds";
});