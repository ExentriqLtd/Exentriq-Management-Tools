Tracker.autorun(function() {
	if (Meteor.user()) {
		var username = Meteor.user().username;
		var company = Session.get('cmp');
		Meteor.subscribe("activities");
		Meteor.subscribe("userBoards", username, company);
		Meteor.subscribe("appUsers");
		Meteor.call('refreshUserProjects', username);

	}
});

// filters
Template.activityTracker.filters = function() {
	var _filters = [
		// project
		{
			id: 'project-filter',
			title: 'Project',
			disabled: false,
			initValue: '',
			dropDownFieldName: 'title',
			dropDown: true,
			dropDownValues: []
		},
		// space
		{
			id: 'space-filter',
			title: 'Space',
			disabled: (Session.get('cmp') ? true : false),
			initValue: (Session.get('cmp') && Session.get('cmp').cmpName) || '',
			dropDown: !Session.get('cmp')
		},
		// user
		{
			id: 'user-filter',
			title: 'User',
			disabled: (Session.get('user') ? true : false),
			initValue: (Session.get('user') && Session.get('user').userName) || '',
			dropDownFieldName: 'username',
			dropDown: !Session.get('user'),
			dropDownValues: []
		},
		// from
		{
			id: 'from-filter',
			title: 'From',
			disabled: false,
			initValue: '',
			dropDown: false
		},
		// to
		{
			id: 'to-filter',
			title: 'To',
			disabled: false,
			initValue: '',
			dropDown: false
		}
	];

	function get() {
		return _filters;
	}

	function set(_filterId, _filterProperty, _filterValue) {
		_filters.forEach(function(i) {
			if (i.id === _filterId) {
				i[_filterProperty] = _filterValue;
				return false;
			}
		});
	}

	return {
		get: get,
		set: set
	}
}

var _filters = Template.activityTracker.filters();
Session.set('_filters', _filters.get());

// sprintPlanner template
Template.activityTracker.render = function(_param) {}

Template.activityTracker.onCreated(function() {});

Template.activityTracker.getActivitiesWithFilter = function() {

	var request = {};
	if (Session.get('cmp')) {
		request.cmpId = Session.get('cmp').cmpId;
	}

	if (Session.get('project')) {
		request.project = Session.get('project');
	}

	if (Session.get('user')) {
		request.userId = Session.get('user').userId;
	}

	if ($('#project-filter').val()) {
		request.project = $('#project-filter').val();
	}

	if ($('#space-filter').val()) {
		request.cmpName = $('#space-filter').val();
	}

	if ($('#user-filter').val()) {
		request.userName = $('#user-filter').val();
	}

	var activities = Activities.find(request);
	return activities.fetch();
};

Template.activityTracker.helpers({
	activities: function() {
		Session.set('activities', Template.activityTracker.getActivitiesWithFilter());
		return Session.get('activities');
	},
	autocompleteSettings: function() {
		return {
			position: "bottom",
			limit: 10,
			rules: [{
				token: '#',
				collection: UserBoards,
				field: "title",
				noMatchTemplate: Template.noMatch,
				template: Template.activityBoardPill,
			}, {
				token: '@',
				collection: AppUsers,
				field: "username",
				noMatchTemplate: Template.noMatch,
				template: Template.userPill,
			}]
		};
	},
	filterItems: function() {
		return Session.get('_filters');
	},
	totalTime: function() {

		var activities = Session.get('activities');
		var totalDays = 0;
		var totalHours = 0;
		var totalMinutes = 0;

		activities && activities.length &&
			activities.forEach(function(i) {

				i.days && (totalDays += i.days);
				i.hours && (totalHours += i.hours);
				i.minutes && (totalMinutes += i.minutes);
			});

		if (totalMinutes > 60) {
			var hrs = Math.floor(totalMinutes / 60);
			totalHours += hrs;
			totalMinutes = totalMinutes - (hrs * 60);
		}

		if (totalHours > 24) {
			var days = Math.floor(totalHours / 24);
			totalDays += days;
			totalHours = totalHours - (days * 24);
		}

		var total = '';
		if (totalDays > 0) {
			total += totalDays + 'd ';
		}
		if (totalHours > 0) {
			total += totalHours + 'h ';
		}
		if (totalMinutes > 0) {
			total += totalMinutes + 'm';
		}
		return total;
	}
});

Template.activityTracker._exportTableToPDF = function(source) {

	var pdf = new jsPDF('p', 'pt', 'letter');
	// source can be HTML-formatted string, or a reference
	// to an actual DOM element from which the text will be scraped.
	//source = $('#customers')[0];

	// we support special element handlers. Register them with jQuery-style 
	// ID selector for either ID or node name. ("#iAmID", "div", "span" etc.)
	// There is no support for any other type of selectors 
	// (class, of compound) at this time.
	specialElementHandlers = {
		// element with id of "bypass" - jQuery style selector
		'#bypassme': function(element, renderer) {
			// true = "handled elsewhere, bypass text extraction"
			return true
		}
	};
	margins = {
		top: 80,
		bottom: 60,
		left: 40,
		width: 522
	};
	// all coords and widths are in jsPDF instance's declared units
	// 'inches' in this case
	pdf.fromHTML(
		source, // HTML string or DOM elem ref.
		margins.left, // x coord
		margins.top, { // y coord
			'width': margins.width, // max width of content on PDF
			'elementHandlers': specialElementHandlers
		},

		function(dispose) {
			// dispose: object with X, Y of the last line add to the PDF 
			//          this allow the insertion of new lines after html
			pdf.save('Test.pdf');
		}, margins);
}

Template.activityTracker.events({
	'click #filter-dropdown-user-filter li': function(evt, tpl) {
		_filters.set('user-filter', 'initValue', this.title);
		Session.set('_filters', _filters.get());
	},
	'click #filter-dropdown-space-filter li': function(evt, tpl) {},
	'click #filter-dropdown-project-filter li': function(evt, tpl) {
		_filters.set('project-filter', 'initValue', this.title);
		Session.set('_filters', _filters.get());	
	},
	'click #export-activity': function() {

		Template.activityTracker._exportTableToPDF($('#export-table-wrapper')[0]);
	},
	'click #apply-filter-button': function(evt, tpl) {
		Session.set('activities', Template.activityTracker.getActivitiesWithFilter());
		return Session.get('activities');
	},
	'keyup #statement-eml': function(evt, tpl) {},
	'click #statement-add': function(evt, tpl) {
		evt.preventDefault();
		Template.activityTracker.updateActivity(null, tpl.find('#statement-eml').value);
	},
	'keypress #statement-eml': function(evt, tpl) {
		//		var value = tpl.find('#statement-eml').value;
		//		var char = String.fromCharCode(event.which);
		//		console.log(char);
	},
	"autocompleteselect input": function(event, template, doc) {

		var replaceFrom;
		var replaceTo;
		if (doc.hasOwnProperty('title')) {
			replaceFrom = '#' + doc.title;
			replaceTo = "#\"" + doc.title + " (" + doc.spaceTitle + ")" + "\""
		} else {
			replaceFrom = '@' + doc.username;
			replaceTo = "@\"" + doc.username + "\""
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

			if (regexpBoardDoubleQuoteResult) {
				projName = regexpBoardDoubleQuoteResult[2].trim();
			} else if (regexpBoardResult) {
				projName = regexpBoardResult[2].trim();
			}

			var proj = UserBoards.find({
				title: projName
			}).fetch();

			if (proj.length) {
				if (_id) {
					Meteor.call('updateActivity', _id, {
						statement: statement,
						cmpId: Session.get('cmp') ? Session.get('cmp').cmpId : '',
						cmpName: Session.get('cmp') ? Session.get('cmp').cmpName : '',
						userId: Meteor.userId(),
						userName: Meteor.user().username,
						time: time
					});
				} else {
					Meteor.call('addActivityEml', {
						statement: statement,
						cmpId: Session.get('cmp') ? Session.get('cmp').cmpId : '',
						cmpName: Session.get('cmp') ? Session.get('cmp').cmpName : '',
						userId: Meteor.userId(),
						userName: Meteor.user().username,
					});
					$('#statement-eml').val('');
				}
			} else {
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

	// Set date picker
	$('#from-filter').datepicker();
	$('#to-filter').datepicker();

	// get users
	_filters.set('project-filter', 'dropDownValues', UserBoards.find().fetch().map(function(i) {
		return {
			title: i.title
		}
	}));
	if (Session.get('cmp')) {
		_filters.set('space-filter', 'initValue', Session.get('cmp').cmpName);
		_filters.set('space-filter', 'disabled', true);

		Meteor.call('getUserInSpace', Session.get('cmp').cmpId, function(error, data) {
			if (error) {
				_filters.set('user-filter', 'dropDownValues', []);
				Session.set('_filters', _filters.get());
			} else {
				_filters.set('user-filter', 'dropDownValues', data.map(function(i) {
					return {
						title: i.username
					}
				}));
				Session.set('_filters', _filters.get());
			}
		});
	}

	if (Session.get('user')){
		_filters.set('user-filter', 'initValue', Session.get('user').userName);
		_filters.set('user-filter', 'disabled', true);		
	}

	Session.set('_filters', _filters.get());
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
	selectedActivity: function() {
		return Session.get('selectedActivity');
	}
});

Template.editActivity.events({
	'click #activity_save_submit': function(evt, tpl) {
		var activity = Session.get('selectedActivity');
		var statement = tpl.find('#logged').value + ' #"' + tpl.find('#project').value + '(' + activity.cmpName + ')" ' + tpl.find('#description').value;
		Template.activityTracker.updateActivity(activity._id, statement, tpl.find('#time').value);
	}
});

Template.activityBoardPill.events({

})