Tracker.autorun(function(){
  if(Meteor.user()){
    var username = Meteor.user().username;
	var company = Session.get('cmp');
	console.log(company);
    console.log("username: " + username);
    Meteor.subscribe("activities");
	Meteor.subscribe("userBoards", username, company);
	Meteor.subscribe("appUsers");
	Meteor.call('refreshUserProjects', username);
	
  }
});

// sprintPlanner template
Template.activityTracker.render = function(_param) {
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
	},
	autocompleteSettings: function() {
	    return {
	      position: "bottom",
	      limit: 10,
	      rules: [
	        {
	          token: '#',
	          collection: UserBoards,
	          field: "title",
	          noMatchTemplate: Template.noMatch,
	          template: Template.activityBoardPill,
	        },
	        {
	          token: '@',
	          collection: AppUsers,
	          field: "username",
	          noMatchTemplate: Template.noMatch,
	          template: Template.userPill,
	        }
	      ]
	    };
	  }
});

Template.activityTracker.events({
	'keyup #statement-eml': function(evt, tpl) { },
	'click #statement-add': function(evt, tpl) {
		evt.preventDefault();
		Template.activityTracker.updateActivity(null, tpl.find('#statement-eml').value);
	},
	'keypress #statement-eml':function(evt, tpl){
//		var value = tpl.find('#statement-eml').value;
//		var char = String.fromCharCode(event.which);
//		console.log(char);
	},
	"autocompleteselect input": function(event, template, doc) {
	    
	    var replaceFrom;
		var replaceTo;
		if(doc.hasOwnProperty('title')){
			replaceFrom = '#'+doc.title;
			replaceTo = "#\""+doc.title + " (" + doc.spaceTitle + ")" +"\""
		}
		else{
			replaceFrom = '@'+doc.username;
			replaceTo = "@\""+doc.username+"\""
		}
		var statementDom = template.find('#statement-eml');
	    var statement = statementDom.value.replace(replaceFrom, replaceTo);
	    $(statementDom).val(statement);
	  }
});

Template.activityTracker.updateActivity = function(_id, statement, time) {
	if (statement) {
		
		// validate proj
		var regexpBoardDoubleQuote = /(#)\"([^\"^\(^\)]+)(?:\(([^\"^\(^\)]+)\))?"/g;
		var regexpBoard = /(#)([^"^\s]+)/g;
		var regexpBoardDoubleQuoteResult = regexpBoardDoubleQuote.exec(statement);
		var regexpBoardResult = regexpBoard.exec(statement);

		// validate days
		var regexDays = /\b([0-9]+)(d|D|day|days|DAY|DAYS|Day|Days)\b/g;
		var regexpDaysResult = regexDays.exec(statement);

		// validate hours
		var regexHours = /\b([0-9]+)(h|H|hour|hours|HOUR|HOURS|Hour|Hours)\b/g;
		var regexpHoursResult = regexHours.exec(statement);

		// validate minutes
		var regexMinutes = /\b([0-9]+)(m|M|minute|minutes|MINUTE|MINUTES|Minute|Minutes)\b/g;
		var regexpMinutesResult = regexMinutes.exec(statement);

		if ((regexpBoardResult !== null || regexpBoardDoubleQuoteResult !== null) && (regexpDaysResult || regexpHoursResult || regexpMinutesResult)) {
			
			// check proj
			var projName = '';

			if (regexpBoardDoubleQuoteResult){
				projName = regexpBoardDoubleQuoteResult[2].trim();
			}
			else if (regexpBoardResult){
				projName = regexpBoardResult[2].trim();
			}

			var proj = UserBoards.find({title: projName}).fetch();
			
			if (proj.length){
				if (_id){
					Meteor.call('updateActivity', _id, {
						statement: statement,
						cmpId: Session.get('cmp') ? Session.get('cmp').cmpId : '',
						cmpName: Session.get('cmp') ? Session.get('cmp').cmpName : '',
						userId: Meteor.userId(),
						userName: Meteor.user().username,
						time: time
					});
				}
				else {
					Meteor.call('addActivityEml', {
						statement: statement,
						cmpId: Session.get('cmp') ? Session.get('cmp').cmpId : '',
						cmpName: Session.get('cmp') ? Session.get('cmp').cmpName : '',
						userId: Meteor.userId(),
						userName: Meteor.user().username,
					});
					$('#statement-eml').val('');
				}				
			}
			else {
				$('#statement-eml').addClass('invalid');
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

	$('#statement-eml').attr('autocomplete', 'off');
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
	},
	'click .eml-edit': function(evt, tpl) {
		Session.set('selectedActivity', this);
		$('#eq-ui-modal-edit').openModal();
		$('#time').val(moment(this.time).format('MM/DD/YYYY')).datepicker();
		
		/*setTimeout(function(){
			$('#eq-ui-modal-edit').find('input').each(function(i){
				$(i).click().focus().blur();
			})
		});*/
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
		var activity = Session.get('selectedActivity');
		var statement = tpl.find('#logged').value + ' #"' + tpl.find('#project').value + '('+activity.cmpName+')" ' +  tpl.find('#description').value;
		Template.activityTracker.updateActivity(activity._id, statement, tpl.find('#time').value);
	}
});

Template.activityBoardPill.events({

})