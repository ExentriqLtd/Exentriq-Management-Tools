Tracker.autorun(function(){
  if(Meteor.user()){
	  console.log('refreshAppUsers');
	  Meteor.call('refreshAppUsers');
	  console.log('refreshBoards');
	  Meteor.call('refreshBoards');
  }
});
// sprintPlanner template
Template.sprintPlanner.render = function(_param) {
	var param = $.extend({
		cmpId: ''
	}, _param);
	
	var cmpId = param.cmpId;
	Template.sprintPlanner._cmpId = cmpId;
}

Template.sprintPlanner.onCreated(function() {
	var space = Template.sprintPlanner._cmpId;

	//BEGIN: ORGANIZATION MANAGER TREE VIEW
	var cmpId = space;
	Meteor.subscribe("ordering", {
		onReady: function() {
			ordering = Ordering.find({
				cmpId: cmpId
			}).fetch()[0] || null;
			Meteor.subscribe("spaces", {
				onReady: function() {

					var query = Spaces.find({
						cmpId: cmpId
					});

					var childrens = [{
						cmpId: null,
						id: null,
						name: "All Teams",
						type: "space"
					}];
					childrens = childrens.concat(Template.orgManager.convertNode(query.fetch()))

					Template.treeView.setModel({
						name: "root",
						children: childrens
					});
				},
				onError: function() {
					// error spaces subscribe
				}
			});
		}
	});

	function getAllMembers(space) {
		var members = [];
		var spaces = Spaces.find({
			parent: space._id
		});
		spaces.forEach(function(space) {
			if (space.type === 'space') {
				subSpaceMembers = getAllMembers(space);
				members = members.concat(subSpaceMembers);
			} else if (space.type === 'user') {
				members.push(space);
			}
		});
		return members;
	}

	Template.sideMenu.events({
		'click .user': function(event) {
			var target = $(event.target);
			var li = target.parents("li");
			var user = li.data('item');
			console.log(user);
			var team = {
				"name": user.name + " (user)",
				members: [user.name]
			};
			Session.set('selectedTeam', team);
		},
		'click .space': function(event) {
			var target = $(event.target);
			var li = target.parents("li");
			var space = li.data('item');
			console.log(space._id);
			if (space.type === 'space') {
				if (typeof space._id === "undefined") {
					Session.set('selectedTeam', null);
				} else {
					var members = getAllMembers(space);
					console.log(members);
					var team = {
						"name": space.name + " (team)",
						members: []
					};
					members.forEach(function(member) {
						team.members.push(member.name);
					});
					Session.set('selectedTeam', team);
				}

			}
		}
	});
	//END: ORGANIZATION MANAGER TREE VIEW

	Meteor.subscribe("tasks", space);
	Meteor.subscribe("appUsers");
	Meteor.subscribe("boards");
	
	Session.set('space', space);
	Session.set('selectedTeam', null);

});

Template.sprintPlanner.helpers({
	tasks: function() {
		var team = Session.get('selectedTeam');
		var tasks;
		if (team !== null) {
			tasks = Tasks.find({
				users: {
					$in: team.members
				}
			});
		} else {
			tasks = Tasks.find();
		}
		return tasks;
	},
	teams: function() {
		return Session.get('teams');
	},
	statementId: function() {
		return Session.get('statementId');
	},
	description: function() {
		return Session.get('description');
	},
	selectedTeam: function() {
		return Session.get('selectedTeam');
	},
	teamName: function() {
		var team = Session.get('selectedTeam');
		if (team === null) {
			return "All Teams"
		} else {
			return team.name;
		}
		return team.name;
	}
});

Template.sprintPlanner.events({
	'click #statement-add': function(evt, tpl) {
		evt.preventDefault();
		var username = Meteor.user().username;
		var space = Session.get('space');
		var statementEml = tpl.find('#statement-eml').value;
		var selectedTeam = Session.get('selectedTeam');

		Meteor.call('addEmlStatement', statementEml, username, space);
	},

	'click .team-item': function(evt, tpl) {
		Session.set('statementId', '');
		Session.set('description', '');
		if (this.name == undefined) {
			Session.set('selectedTeam', null);
		} else {
			Session.set('selectedTeam', this);
		}

		var selectedTeam = Session.get('selectedTeam');

	},
	'click .eml-edit': function(evt, tpl) {
		console.log('cliccato edit');
		var emlId = this.eml_id;
		var description = this.what_and_why;
		Session.set('statementId', emlId);
		Session.set('description', description);
		Session.set('selectedTask', this);
		$('#eq-ui-modal-edit').openModal();
	},
	"autocompleteselect input": function(event, template, doc) {
		var replaceFrom;
		var replaceTo;
		if(doc.hasOwnProperty('title')){
			replaceFrom = '#'+doc.title;
			replaceTo = "#\""+doc.title+"\""
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

Template.sprintPlanner.rendered = function() {
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

//editEml template
Template.editEml.helpers({
	statementId: function() {
		return Session.get('statementId');
	},
	description: function() {
		return Session.get('description');
	},
	selectedTask: function() {
		return Session.get('selectedTask');
	}
});

Template.editEml.events({
	'click #statement-modify': function(evt, tpl) {
		evt.preventDefault();

		console.log('modify');

		var eml = Session.get('selectedTask');
		eml.points = tpl.find('#edit-statement-points').value;
		eml.milestone = tpl.find('#edit-statement-milestone').value;
		eml.card = tpl.find('#edit-statement-card').value;
		eml.board = tpl.find('#edit-statement-board').value;
		eml.progress = tpl.find('#edit-statement-progress').value;
		eml.effort = tpl.find('#edit-statement-effort').value;
		eml.eta = tpl.find('#edit-statement-eta').value;
		eml.closed_on = tpl.find('#edit-statement-closedOn').value;

		var users = tpl.find('#edit-statement-users').value;
		var usersArray = users.split(",");
		eml.users = [];
		usersArray.forEach(function(elem) {
			var user = elem.trim();
			if (user !== '') {
				eml.users.push(user);
			}
		});

		var task = Tasks.findOne({
			eml_id: eml.eml_id
		});
		console.log(task);
		Tasks.update(task._id, eml);

	}

});

//addEml template
Template.addEml.helpers({
	statementId: function() {
		return Session.get('statementId');
	},
	description: function() {
		return Session.get('description');
	},
	autocompleteSettings: function() {
	    return {
	      position: "bottom",
	      limit: 20,
	      rules: [
	        {
	          token: '@',
	          collection: AppUsers,
	          field: "username",
	          template: Template.userPill
	        },
	        {
	          token: '#',
	          collection: Boards,
	          field: "title",
	          template: Template.boardPill
	        }
	      ]
	    };
	  }
});

//deleteEml template
Template.deleteEml.events({
	'click #statement-delete': function(evt, tpl) {

		var selectedTask = Session.get('selectedTask');
		Tasks.remove(selectedTask._id);

	}
});

//spTask template
Template.spTask.onRendered(function() {
	$('.dropdown-trigger').dropdown({
		inDuration: 300,
		outDuration: 225,
		hover: true,
		gutter: 0,
		belowOrigin: false
	});
});

Template.spTask.events({

	'click .eml-delete': function(evt, tpl) {
		Session.set('selectedTask', this);
		$('#eq-ui-modal-delete').openModal();
	}

});

Template.spTask.helpers({
	isClosed: function(closedOn) {
		return (closedOn);
	}
});

var handleTasks = function(err, res) {
	if (err) {
		Session.set('tasks', {
			error: err
		});
	} else {
		Session.set('tasks', res);
		return res;
	}
}