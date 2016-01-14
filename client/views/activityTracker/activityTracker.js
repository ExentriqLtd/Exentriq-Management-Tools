// sprintPlanner template
Template.activityTracker.render = function(_param) {
	Meteor.subscribe("activities")
}

Template.activityTracker.onCreated(function() {

});

Template.activityTracker.helpers({
	activities: function() {

		var request = {
			cmpId: Session.get('cmp').cmpId,
		}

		if (Session.get('project')) {
			request.project = Session.get('project');
		}

		var activities = Activities.find(request);
		return activities;
	}
});



Template.activityTracker.events({
	'keyup #statement-eml': function(evt, tpl) {
		evt.preventDefault();
		evt.stopPropagation();
		if (evt.keyCode == '13'){
			Template.activityTracker.addActivity(tpl);	
		}
	},
	'click #statement-add': function(evt, tpl) {
		evt.preventDefault();
		Template.activityTracker.addActivity(tpl);
	}
});

Template.activityTracker.addActivity = function(tpl) {
	var statement = tpl.find('#statement-eml').value;
	if (statement) {
		var regexpBoard = /#([^\s]*)/g;
		var regexpBoardResult = regexpBoard.exec(statement);
		if (regexpBoardResult !== null) {
			Meteor.call('addActivityEml', {
				statement: statement,
				cmpId: Session.get('cmp').cmpId,
				cmpName: Session.get('cmp').cmpName,
				userId: Session.get('user').userId,
			});

			$('#statement-eml').val('');
		}
	}
};

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

//editActivity
Template.editActivity.helpers({
	contextMenuActivity: function(){
		return Session.get('contextMenuActivity');
	}
});