Meteor.publish("tasks", function (space) {
   return Tasks.find({space:space});
});
Meteor.publish("appUsers", function () {
   return AppUsers.find({}, {sort: {username: +1}});
});
Meteor.publish("boards", function (space) {
   return Boards.find({space:space}, {sort: {title: +1}});
});
Meteor.publish("all_boards", function (space) {
    return Boards.find({}, {sort: {title: +1}});
 });

Meteor.startup(function () {
    // Global configuration
    Api = new Restivus({
      version: 'v1',
      useDefaultAuth: true,
      prettyJson: true,
      apiPath: 'sprintplanner/api/'
    });
 
    // Generates: GET/POST on sprintplanner/api/v1/tasks, and GET/PUT/DELETE on sprintplanner/api/v1/tasks/:id 
    // for Mongo.Collection("tasks") collection
    Api.addCollection(Tasks);

    Api.addRoute('addEml', {authRequired: false}, {
      post: {
        roleRequired: [],
        action: function () {
          var spaceid;
          var statementEml = this.bodyParams.message;
          var username = this.bodyParams.author;
          var statementId = Random.id();
          try {
              var eml = stringToEml(statementEml, statementId, username , spaceid);
	      
              if(eml.project){
                  var filter = {title:eml.project};
                  if(eml.cmpName){
            	  	filter.spaceTitle=eml.cmpName;
                  }
                  var prj = UserBoards.findOne(filter);
                  if(prj!=null){
            	  	eml.space = prj.space;
                  }
              }
              
              console.log(eml);
              if(!eml.users || !eml.users.length>0){
        	  return {"status":"fail", "error":"users not found"};
              }
              if(!eml.board){
        	  return {"status":"fail", "error":"project not found"};
              }
              if(!eml.space){
        	  return {"status":"fail", "error":"space not found"};
              }
              addTask(eml);
              return {"status":"success"};
          } catch (e) {
              return {"status":"fail", "error":"generic error"};
          }
        }
      }
    });
    
    Api.addRoute('tryAddEml', {authRequired: false}, {
      post: {
        roleRequired: [],
        action: function () {
          var spaceid;
          var statementEml = this.bodyParams.message;
          var username = this.bodyParams.author;
          var statementId = Random.id();
          try {
              var eml = stringToEml(statementEml, statementId, username , spaceid);
	      
              if(eml.project){
                  var filter = {title:eml.project};
                  if(eml.cmpName){
            	  	filter.spaceTitle=eml.cmpName;
                  }
                  var prj = UserBoards.findOne(filter);
                  if(prj!=null){
            	  	eml.space = prj.space;
                  }
              }
              
              console.log(eml);
              if(!eml.users || !eml.users.length>0){
        	  return {"status":"fail", "error":"users not found"};
              }
              if(!eml.board){
        	  return {"status":"fail", "error":"project not found"};
              }
              if(!eml.space){
        	  return {"status":"fail", "error":"space not found"};
              }
              return {"status":"success"};
          } catch (e) {
              return {"status":"fail", "error":"generic error"};
          }
        }
      }
    });
    
    Api.addRoute('changeUsername', {authRequired: false}, {
        post: {
          roleRequired: [],
          action: function () {
            var from = this.bodyParams.from;
            var to = this.bodyParams.to;

            console.log('change from ' + from + ' to ' + to);
            
            //verifico se l'utente esiste
            var appUser = AppUsers.findOne({username: to});
            if(appUser){
            	return {"status":"FAIL", "error":"username exists", "detail":"app user"};
            }
            
            var task = Tasks.findOne({author: to});
            if(task){
            	return {"status":"FAIL", "error":"username exists", "detail":"task author"};
            }
            
            var filter = {};
            filter.users ={ $in: [to] };
            task = Tasks.findOne(filter);
            if(task){
            	return {"status":"FAIL", "error":"username exists", "detail":"task user"};
            }
            
            try {
            	 //rinomino l'utente
                appUser = AppUsers.findOne({username: from});
                if(appUser){
                	appUser.username=to;
                	AppUsers.update(appUser._id, appUser);
                }
                
                var tasks = Tasks.find({author: from}).fetch();
                if(tasks.length>0){
                	tasks.forEach(function(task){
                		task.author=to;
                		Tasks.update(task._id, task);
                	});
                }
                
                tasks = Tasks.find({"users":{ $in: [from] }}).fetch();
                if(tasks.length>0){
                	tasks.forEach(function(task){
                		var users = task.users;
                		var index = users.indexOf(from);
                		if (index > -1) {
                			users.splice(index, 1);
                			users.push(to);
                		}
                		Tasks.update(task._id, task);
                	});
                }
			} catch (e) {
				return {"status":"FAIL", "error":"generic error updating username"};
			}
           
            
            return {"status":"OK", "from":from, "to":to	};
          }
        }
      });
    
    Api.addRoute('users/:username/tasks', {authRequired: false}, {
    	get: {
            roleRequired: [],
            action: function () {
              try {
            	  var username = this.urlParams.username;
            	  console.log(username);
            	  var tasks = Tasks.find({"users":{ $in: [username] }}).fetch();
            	  return { status: "OK", "tasks": tasks };
              }
              catch(e){
            	  console.log(e);
            	  return { status: "FAIL"};
              }
            }
          }
    });
    
    Api.addRoute('spaces/:spaceid/tasks', {authRequired: false}, {
    	get: {
            roleRequired: [],
            action: function () {
              try {
            	  var spaceid = this.urlParams.spaceid;
            	  console.log(spaceid);
            	  var tasks = Tasks.find({"space":spaceid}).fetch();
            	  return { status: "OK", "tasks": tasks };
              }
              catch(e){
            	  console.log(e);
            	  return { status: "FAIL"};
              }
            }
          }
    });
    
    Api.addRoute('appUsers', {authRequired: false}, {
        post: {
          roleRequired: [],
          action: function () {
            var username = this.bodyParams.username;
            var appUser = AppUsers.findOne({username: username});
            if(appUser){
            	return {"status":"fail", "error":"username exists", "detail":"add new user"};
            }
            var user = {"username":username};
            AppUsers.update({username:username},user, { upsert: true } );
            console.log(username);
            return { "status": "success", "data": {username:username}};
          }
        }
      });
    
     Api.addRoute('custom/tasks/:taskid', {authRequired: false}, {
        put: {
          roleRequired: [],
          action: function () {
              try {
        	  var task = this.bodyParams.task;
                  var username = this.bodyParams.username;
                  updateTask(task, username);
                  return { "status": "success"};
	    } catch (e) {
		console.log(e);
		return { "status": "fail", "message": e.message};
	    }
            
            
            console.log(username);
            return { "status": "success", "data": {username:username}};
          }
        }
      });
  });

Meteor.methods({
	
	'addEmlStatement' : function(statementEml, username, space) {
		var statementId = Random.id();
		var eml = stringToEml(statementEml, statementId, username , space);
		addTask(eml);
	},
	'updateTask' : function(task, username) {
		updateTask(task, username);
	},
	'refreshAppUsers' : function(){
		this.unblock();
		var apiUrl = Meteor.settings.private.integrationBusPath + '/getAllUsers';
		var response = Rest.get(apiUrl);
		if(response!=null){
			response.forEach(function(user){
				AppUsers.update({username:user.username},user, { upsert: true } );
			});
		}
	},
	'refreshBoards' : function(){
		this.unblock();
		var apiUrl = Meteor.settings.private.integrationBusPath + '/getAllProjects';
		var response = Rest.get(apiUrl);
		if(response!=null){
		    	Boards.update({}, {$set: {"old":true}}, {multi:true});
			response.forEach(function(board){
			    	Boards.remove({id:board.id});
				Boards.insert(board);
			});
			Boards.remove({"old":true});
		}
	}
});

var addTask = function(task){
	//Save the task
	Tasks.insert(task);
	//Send notification to all users added to the task
	var users = task.users;
	users.forEach(function(username){
		var author = task.author;
		var picture = Meteor.settings.private.talkPath + "/avatar/"+author+".jpg";
		var subject = author+' assigned you the mission "'+task.statement+'"';
		var notification = {'from':author, 'to':username, 'link':'/management-tools?spaceid='+task.space+'&menu=sprintplanner','subject':subject, 'picture':picture,'type':'mission'};
		Bus.sendNotification(notification, Meteor.settings.private.integrationBusPath);
	});
}

var updateTask = function(task, updateUser){
    	
    	if(!updateUser){
    	    updateUser = 'somebody';
    	}
    
	var oldTask = Tasks.findOne({
		eml_id: task.eml_id
	});
	task._id = oldTask._id;
	var wasOpen = isOpen(oldTask);
	var nowIsOpen = isOpen(task);
	
	//Update the task
	Tasks.update(task._id, task);
	
	var oldUsers = oldTask.users;
	var users = task.users;

	//Send notification to new users added to the task
	users.forEach(function(username){
	    	var author = updateUser;
	    	var picture = Meteor.settings.private.talkPath + "/avatar/"+author+".jpg";
	    	var link = '/management-tools?spaceid='+task.space+'&menu=sprintplanner';
	    	var subject = '';
	    	var type='mission';
	    	if(wasOpen!=nowIsOpen){
	    	    var verb = (nowIsOpen) ? ' opened':' closed';
	    	    subject = author + verb + ' the mission "'+task.statement+'"';
	    	}
	    	else{
	    	    if(oldUsers.indexOf(username)<0){
	    		subject = author+' assigned you the mission "'+task.statement+'"';
	    	    }
	    	    else{
	    		type = 'mission_update'
	    		subject = author+' updated the mission "'+task.statement+'"';
	    	    }
	    	}
	    	
		var notification = {'from':author, 'to':username, 'link':link,'subject':subject, 'picture':picture,'type':type};
		console.log(notification);
		Bus.sendNotification(notification, Meteor.settings.private.integrationBusPath);
	});
}

var isOpen = function(task){
    var closedOn = task.closed_on;
    return !(closedOn && closedOn!=='');
}

var stringToEml = function(statement, id, author, space){
	eml = Eml.parse(statement);
	eml.what_and_why=eml.clean;
	//In SprintPlanner projects ar called boards
	eml.board=eml.project;
	eml.author=author;
	eml.eml_id=id;
	eml.space=space;
	return eml;
}
