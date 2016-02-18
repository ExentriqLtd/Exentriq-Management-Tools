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

// sprintPlanner template
Template.activityTracker.render = function(_param) {}

Template.activityTracker.onCreated(function() {});

Template.activityTracker.getActivitiesWithFilter = function() {

	var request = {};
	if (Session.get('cmp')) {
		request.cmpId = Session.get('cmp').cmpId;
		request.cmpName = Session.get('cmp').cmpName;
	}

	if (Session.get('project')) {
		request.project = Session.get('project');
	}

	if (Session.get('user')) {
		//		request.userId = Session.get('user').userId;
		request.userName = Session.get('user').userName;
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

	if ($('#description-filter').val()) {
		request.description = $('#user-filter').val();
	}

	Session.set('lastRequestFilter', request);


	var from, to;
	var tf = $('#time-filter').val();
	Session.set('lastTimeFilter', tf);

	if (tf) {
		tf = tf.split('-');
		from = moment(tf[0].replace(' ', ''));
		to = moment(tf[1].replace(' ', ''));
	} else {
		from = moment().subtract(29, 'days');
		to = moment();
	}

	var activities = Activities.find(request);
	return activities.fetch()
		.filter(function(t) {

			// if property time is missing
			if (!t.time) {
				return true;
			}
			return t.time.getTime() > from._d.getTime() && t.time.getTime() < (to._d.getTime() + (1000 * 60 * 60 * 24));
		})
		.sort(function(a, b) {

			// if property time is missing
			if (!a.time || !b.time) {
				return 0;
			}

			if (a.time.getTime() > b.time.getTime()) {
				return -1;
			} else if (a.time.getTime() < b.time.getTime()) {
				return 1;
			} else return 0;
		});
};

Template.activityTracker.helpers({
	projectFilter: function() {
		return Session.get('lastRequestFilter').project || 'ALL';
	},
	descriptionFilter: function() {
		return Session.get('lastRequestFilter').description || 'ALL';
	},
	spaceFilter: function() {
		return Session.get('lastRequestFilter').cmpName || 'ALL';
	},
	userFilter: function() {
		return Session.get('lastRequestFilter').userName || 'ALL';
	},
	timeFilter: function() {
		return Session.get('lastTimeFilter') || 'ALL';
	},
	loggedFilter: function() {
		return Session.get('lastRequestFilter').logged || 'ALL';
	},
	currentUserName: function() {
		return Meteor.user().username;
	},
	activities: function() {
		Session.set('activities', Template.activityTracker.getActivitiesWithFilter());
		return Session.get('activities');
	},
	autocompleteFilterProject: function() {
		return {
			position: "bottom",
			limit: 10,
			rules: [{
				token: '',
				collection: UserBoards,
				field: "title",
				noMatchTemplate: Template.noMatch,
				template: Template.activityBoardPill
			}]
		};
	},
	autocompleteFilterUser: function() {
		return {
			position: "bottom",
			limit: 10,
			rules: [{
				token: '',
				collection: AppUsers,
				field: "username",
				noMatchTemplate: Template.noMatch,
				template: Template.userPill
			}]
		};
	},
	autocompleteFilterSpace: function() {
		return {
			position: "bottom",
			limit: 10,
			rules: [{
				token: '',
				collection: [],
				field: "title",
				noMatchTemplate: Template.noMatch,
				template: Template.activityBoardPill
			}]
		};
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
				template: Template.activityBoardPill
			}, {
				token: '@',
				collection: AppUsers,
				field: "username",
				noMatchTemplate: Template.noMatch,
				template: Template.userPill
			}]
		};
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

		if (totalHours > 8) {
			var days = Math.floor(totalHours / 8);
			totalDays += days;
			totalHours = totalHours - (days * 8);
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

Template.activityTracker._filterTimeout = null;
Template.activityTracker.events({
	'click td a': function(e) {

		Session.set('selectedActivity', this);
		setTimeout(function() {
			var dd = $('#doc-dropdown-app-bar');
			dd.css({
				width: '100px',
				top: e.clientY - 120 + 'px',
				right: 0
			});
		}, 10);

	},
	'click #exportToPDF': function() {
		Template.activityTracker._exportTableToPDF($('#export-table-wrapper')[0]);
	},
	'change .filter-item input': function() {
		clearTimeout(Template.activityTracker._filterTimeout);
		Template.activityTracker._filterTimeout = setTimeout(function() {
			Session.set('activities', Template.activityTracker.getActivitiesWithFilter());
		}, 1000);
	},
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
	},
	'click .eml-delete': function(evt, tpl) {
		$('#eq-ui-modal-delete').openModal();
	},
	'click .eml-edit': function(evt, tpl) {
		$('#eq-ui-modal-edit').openModal();
		$('#time').val(moment(this.time).format('MM/DD/YYYY')).datepicker();
	}
});

Template.activityTracker.updateActivity = function(_id, statement, time) {
	if (statement) {

		var obj = Eml.parse(statement);

		if (obj.project !== null && (obj.days > 0 || obj.hours > 0 || obj.minutes > 0)) {

			// check proj
			var projName = obj.project;

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

	// set user for user/me
	if (Session.get('user')) {
		$('#user-filter').val(Session.get('user').userName);
		$('#user-filter').attr('disabled', 'disabled');
		$('label[for="user-filter"]').addClass('active');
	}

	// set company 
	if (Session.get('cmp')) {
		$('#space-filter').val(Session.get('cmp').cmpName);
		$('#space-filter').attr('disabled', 'disabled');
		$('label[for="space-filter"]').addClass('active');
	}

	var from = moment().subtract(29, 'days');
	var to = moment();

	Session.set('lastTimeFilter', moment(from).format('MM/DD/YYYY') + ' - ' + moment(to).format('MM/DD/YYYY'));
	$('#time-filter')
		.val(moment(from).format('MM/DD/YYYY') + ' - ' + moment(to).format('MM/DD/YYYY'))
		.daterangepicker({
			ranges: {
				'Today': [moment(), moment()],
				'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
				'Last 7 Days': [moment().subtract(6, 'days'), moment()],
				'Last 30 Days': [moment().subtract(29, 'days'), moment()],
				'This Month': [moment().startOf('month'), moment().endOf('month')],
				'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
			},
			opens: 'left'
		}, function(a, b) {
			console.log(a);
			console.log(b);
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

//deleteActivityEml template
Template.deleteActivityEml.events({
	'click #statement-delete': function(evt, tpl) {
		var selectedActivity = Session.get('selectedActivity');
		Activities.remove(selectedActivity._id);
	}
});

//editActivity
Template.editActivity.helpers({
	autocompleteFilterProject: function() {
		return {
			position: "bottom",
			limit: 10,
			rules: [{
				token: '',
				collection: UserBoards,
				field: "title",
				noMatchTemplate: Template.noMatch,
				template: Template.activityBoardPill
			}]
		};
	},
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

Template.editActivity.rendered = function() {};

Template.activityBoardPill.events({

})