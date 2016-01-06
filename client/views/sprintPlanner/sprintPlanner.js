Tasks = new Mongo.Collection("tasks");


// sprintPlanner template
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

					Template.treeView.organizationManagerModel.children = convertNode(query.fetch());
					_interval = setInterval(function() {

						if (Template.treeView.renderDone) {
							setModel();
							bindObserveChanges(query);

							var orderingQuery = Ordering.find({
								cmpId: cmpId
							});
							ordering = orderingQuery.fetch()[0];
							bindObserveChanges(orderingQuery);
						}
					}, 10);

					Template.sideMenu.organizationManagerModel.children = convertNode(query.fetch());
					_interval = setInterval(function() {

						if (Template.sideMenu.renderDone) {
							setModel();
							bindObserveChanges(query);

							var orderingQuery = Ordering.find({
								cmpId: cmpId
							});
							ordering = orderingQuery.fetch()[0];
							bindObserveChanges(orderingQuery);
						}
					}, 10);
				},
				onError: function() {
					// error spaces subscribe
				}
			});
		}
	});

	function setModel() {

		clearInterval(_interval);
		Template.treeView.setModel(Template.sideMenu.organizationManagerModel);
	}
	function convertNode(allSpaces, _param) {

		var spaces = [
		              {cmpId: null,
			id: null,
			name: "All Teams",
			type: "space"}];
		var allSpacesExt =  allSpaces
			.filter(function(space) {
				return !space.parent;
			})
			.map(function(space) {
				if (!space.parent) {
					return {
						_id: space._id,
						expanded: (_param && _param.expandedNodes.some(function(i) {
							return i == space._id;
						})) || false,
						cmpId: space.cmpId,
						id: space.id,
						name: space.name,
						type: space.type,
						children: getChildrensFor(space, _param),
						position: getPoitionById(space._id)
					};
				}
			}).sort(sortByPosition)
			return spaces.concat(allSpacesExt);
	}

	function getChildrensFor(parent, _param) {

		return Spaces.find({
				parent: parent._id
			})
			.fetch()
			.filter(function(i) {
				return i.parent !== null
			})
			.map(function(i) {
				return $.extend(i, {
					expanded: (_param && _param.expandedNodes.some(function(o) {
						return o == i._id;
					})) || false,
					position: getPoitionById(i._id),
					children: getChildrensFor(i).sort(sortByPosition)
				});
			}).sort(sortByPosition);
	}

	function sortByPosition(a, b) {
		if (a.position > b.position) {
			return 1;
		}
		if (a.position < b.position) {
			return -1;
		}
		return 0;
	}

	function getPoitionById(_id) {

		var p = 0;
		if (ordering && ordering.ordering) {

			ordering.ordering.forEach(function(i) {

				if (i._id == _id) {
					p = i.position;
				}
			});
			return p;
		} else return 0;
	}

	function bindObserveChanges(query) {

		function ready() {

			var orderingQuery = Ordering.find({
				cmpId: cmpId
			});
			ordering = orderingQuery.fetch()[0];
			Template.sideMenu.organizationManagerModel.children = convertNode(
				Spaces.find({
					cmpId: cmpId
				}).fetch(), {
					expandedNodes: $('.mjs-nestedSortable-expanded').toArray().map(function(i) {
						return $(i).data('item')._id || '';
					})
				}
			);

			Template.sideMenu.renderDone && setModel();
		}
		

		query.observeChanges({
			changed: ready,
			added: ready,
			removed: ready
		});
	}
	
	function getAllMembers(space){
		var members = [];
		var spaces = Spaces.find({ parent: space._id });
		spaces.forEach(function(space) {
		    if(space.type==='space'){
		    	subSpaceMembers = getAllMembers(space);
		    	members = members.concat(subSpaceMembers);
		    }
		    else if(space.type==='user'){
		    	members.push(space);
		    }
		});
		return members;
	}
	
	Template.sideMenu.events({
		'click .user': function(event) {
			var target = $(event.target);
			markSelected(target);
			var li = target.parents("li");
			var user = li.data('item');
			console.log(user);
			var team = {"name":user.name + " (user)", members:[user.name]};
			Session.set('selectedTeam', team);
		},
		'click .space': function(event) {
			var target = $(event.target);
			markSelected(target);
			var li = target.parents("li");
			var space = li.data('item');
			console.log(space._id);
			if(space.type==='space'){
				if(typeof space._id === "undefined"){
					Session.set('selectedTeam', null);
				}
				else{
					var members = getAllMembers(space);
					console.log(members);
					var team = {"name":space.name + " (team)", members:[]};
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

	Session.set('username', username);
	Session.set('space', space);
	
	Session.set('selectedTeam', null);

//	Meteor.call('getTasks', username, space, '', handleTasks);
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
//	  var space = Session.get('space', space);
//	  var tasks = Session.get('tasks');
//	  if(typeof tasks !== "undefined")
//	  for (i = 0; i < tasks.length; ++i) {
//		  tasks[i].index = i+1;
//		  console.log(tasks[i].space);
//	  }
//	  return tasks;
	  
	  var team = Session.get('selectedTeam');
	  var tasks;
	  if(team!==null){
		  tasks = Tasks.find({users:{$in:team.members}});
	  }
	  else{
		  tasks = Tasks.find();
	  }
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
  },
  teamName: function () {
    var team = Session.get('selectedTeam');
    if(team===null){
    	return "All Teams"
    }
    else{
    	return team.name;
    }
    return team.name;
  }
});

Template.sprintPlanner.events({
	'click #statement-add': function (evt, tpl) {
		  evt.preventDefault();
		  var username = Session.get('username');
		  var space = Session.get('space');
		  var statementEml = tpl.find('#statement-eml').value;
		  var selectedTeam = Session.get('selectedTeam');
		  
		  Meteor.call('addEmlStatement', statementEml, username , space);
		  //var resp = Meteor.call('addEmlStatementOld', username, space, selectedTeam, statementId, statementEml,handleTasks);
	  },
				
		'click .team-item': function (evt, tpl) {
			Session.set('statementId', '');
			Session.set('description', '');
			if(this.name==undefined){
				Session.set('selectedTeam', null);
			}
			else{
				Session.set('selectedTeam', this);
			}
			
			var selectedTeam = Session.get('selectedTeam');
			
//			var username = Session.get('username');
//			var space = Session.get('space');
//			Meteor.call('getTasks', username, space, selectedTeam, handleTasks);
		},
		'click .eml-edit': function (evt, tpl) {
			console.log('cliccato edit');
			var emlId = this.eml_id;
			var description = this.what_and_why;
			Session.set('statementId', emlId);
			Session.set('description', description);
			Session.set('selectedTask', this);
			$('#eq-ui-modal-edit').openModal();
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
	statementId: function () {
	    return Session.get('statementId');
	  },
	  description: function () {
	    return Session.get('description');
	  },
	  selectedTask: function () {
		return Session.get('selectedTask');
	  }
});

Template.editEml.events({
	'click #statement-modify': function (evt, tpl) {
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
		eml.users=[];
		usersArray.forEach(function(elem) {
		    var user = elem.trim();
		    if(user!==''){
		    	eml.users.push(user);
		    }
		});
				  
		var task = Tasks.findOne({eml_id:eml.eml_id});
		console.log(task);
		Tasks.update(task._id, eml );
	
//		var username = Session.get('username');
//		var space = Session.get('space');
//		var selectedTeam = Session.get('selectedTeam');
//		Tasks.update(statementId, { $set: { what_and_why: eml.what_and_why} });
//		var resp = Meteor.call('addEmlStatement', username, space, selectedTeam, statementId, statementEml,handleTasks);
	  }

});

//addEml template
Template.addEml.helpers({
	statementId: function () {
	    return Session.get('statementId');
	  },
	  description: function () {
	    return Session.get('description');
	  }
});

//deleteEml template
Template.deleteEml.events({
	'click #statement-delete': function (evt, tpl) {
		
		var selectedTask = Session.get('selectedTask');
	    Tasks.remove(selectedTask._id);
	    
//		var username = Session.get('username');
//		var space = Session.get('space');
//		var statementId = this.eml_id;
//		var statementEml = this.what_and_why;
//		var selectedTeam = Session.get('selectedTeam');
		//var resp = Meteor.call('deleteEmlTask', username, space, null, statementId, statementEml,handleTasks);
	}
});

//spTask template
Template.spTask.onRendered(function () {
  $('.dropdown-trigger').dropdown({
      inDuration: 300,
      outDuration: 225,
      hover: true,
      gutter: 0,
      belowOrigin: false
  });
});

Template.spTask.events({
	  
	'click .eml-delete': function (evt, tpl) {
		Session.set('selectedTask', this);
		$('#eq-ui-modal-delete').openModal();
	}

});

Template.spTask.helpers({
	  isClosed: function (closedOn) {
	    return (closedOn);
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

var markSelected = function(target){
	$( ".space-selected" ).each(function() {
		console.log(this);
	  $( this ).removeClass( "space-selected" );
	});
	target.addClass("space-selected");
}
