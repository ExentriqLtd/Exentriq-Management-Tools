// sprintPlanner template
Template.activityTracker.render = function(_param) {
	Meteor.subscribe("activities")
}

Template.activityTracker.onCreated(function() {

});

Template.activityTracker.helpers({
	activities: function() {

		var request = {};

		if (Session.get('cmp')) {
			request.cmpId = Session.get('cmp').cmpId;
		}

		if (Session.get('project')) {
			request.project = Session.get('project');
		}

		if (Session.get('user')){
			request.userId = Session.get('user').userId;
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
			Template.activityTracker.updateActivity(null, tpl.find('#statement-eml').value);	
		}
	},
	'click #statement-add': function(evt, tpl) {
		evt.preventDefault();
		Template.activityTracker.updateActivity(null, tpl.find('#statement-eml').value);
	}
});

Template.activityTracker.updateActivity = function(_id, statement) {
	if (statement) {

		// validate proj
		var regexpBoard = /#([^\s]*)/g;
		var regexpBoardResult = regexpBoard.exec(statement);

		// validate days
		var regexDays = /\b([0-9]*)(d|D|day|days|DAY|DAYS|Day|Days)\b/g;
		var regexpDaysResult = regexDays.exec(statement);

		// validate hours
		var regexHours = /\b([0-9]*)(h|H|hour|hours|HOUR|HOURS|Hour|Hours)\b/g;
		var regexpHoursResult = regexHours.exec(statement);

		// validate minutes
		var regexMinutes = /\b([0-9]*)(m|M|minute|minutes|MINUTE|MINUTES|Minute|Minutes)\b/g;
		var regexpMinutesResult = regexMinutes.exec(statement);

		if (regexpBoardResult !== null && (regexpDaysResult || regexpHoursResult || regexpMinutesResult)) {
			
			if (_id){
				Meteor.call('updateActivity', _id, {
					statement: statement,
					cmpId: Session.get('cmp').cmpId,
					cmpName: Session.get('cmp').cmpName,
					userId: Meteor.userId(),
					userName: Meteor.user().username,
				});
			}
			else {
				Meteor.call('addActivityEml', {
					statement: statement,
					cmpId: Session.get('cmp').cmpId,
					cmpName: Session.get('cmp').cmpName,
					userId: Meteor.userId(),
					userName: Meteor.user().username,
				});
				$('#statement-eml').val('');
			}
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
	},

	'click .eml-edit': function(evt, tpl) {
		Session.set('selectedActivity', this);
		setTimeout(function(){
			$('#eq-ui-modal-edit').find('input').each(function(i){
				$(i).click().focus().blur();
			})
		});
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
	selectedActivity: function(){
		return Session.get('selectedActivity');
	}
});

Template.editActivity.events({
	'click #activity_save_submit': function(evt, tpl){
		var statement = tpl.find('#logged').value + ' #' + tpl.find('#project').value;
		Template.activityTracker.updateActivity(Session.get('selectedActivity')._id, statement);
	}
});