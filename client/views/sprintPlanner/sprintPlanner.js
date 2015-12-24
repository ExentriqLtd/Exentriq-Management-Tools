  
Template.sprintPlanner.render = function(_param) {
	var param = $.extend({
		cmpId: ''
	}, _param);

	var cmpId = param.cmpId;
	Template.sprintPlanner._cmpId = cmpId;
}

Template.sprintPlanner.onCreated(function () {
	var username = 'calogero.crapanzano';
	var space = Template.sprintPlanner._cmpId;
			
	Session.set('username', username);
	Session.set('space', space);
	
	Session.set('selectedTeam', "");

	Meteor.call('getTasks', username, space, '', handleTasks);
	Meteor.call('getTeams', space, function (err, res) {
      if (err) { 
        Session.set('teams', {error: err});
      } else {
        Session.set('teams', res);
        return res;
      }
    });
});

Template.sprintPlanner.helpers({
  tasks: function () {
	  var tasks = Session.get('tasks');
	  console.log(tasks);
	  for (i = 0; i < tasks.length; ++i) {
		  tasks[i].index = i+1;
		  console.log(tasks[i].space);
	  }
	  console.log(tasks);
	  return tasks;
  },
  teams: function () {
	  return Session.get('teams');
  },
  statementId: function () {
    return Session.get('statementId');
  },
  description: function () {
    return Session.get('description');
  },
  selectedTeam: function () {
    return Session.get('selectedTeam');
  }
});

Template.sprintPlanner.events({
	  'click #statement-add': function (evt, tpl) {
		  evt.preventDefault();
		  var username = Session.get('username');
		  var space = Session.get('space');
		  var statementId = tpl.find('#statement-id').value;
		  var statementEml = tpl.find('#statement-eml').value;
		  var selectedTeam = Session.get('selectedTeam');
		  if(statementId==null || statementId==''){
			  statementId = Random.id();
		  }
		  var resp = Meteor.call('addEmlStatement', username, space, selectedTeam, statementId, statementEml,handleTasks);
	  },

		'click #sprint-planner-table tr': function (evt, tpl) {
			var emlId = this.eml_id;
			var description = this.what_and_why;
			Session.set('statementId', emlId);
			Session.set('description', description);
		},
		
		'click .team-item': function (evt, tpl) {
			
			if(this.length==undefined){
				Session.set('selectedTeam', "");
			}
			else{
				Session.set('selectedTeam', this.toString());
			}
			var username = Session.get('username');
			var space = Session.get('space');
			var selectedTeam = Session.get('selectedTeam');
			
			Session.set('statementId', '');
			Session.set('description', '');
			
			Meteor.call('getTasks', username, space, selectedTeam, handleTasks);
		}
	});

var handleTasks = function(err, res) {
	if (err) {
		Session.set('tasks', {error : err});
	} else {
		Session.set('tasks', res);
		return res;
	}
}