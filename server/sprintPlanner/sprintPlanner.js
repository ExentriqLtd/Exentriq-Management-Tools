Meteor.publish("tasks", function (space) {
   return Tasks.find({space:space});
});
Meteor.publish("appUsers", function () {
   return AppUsers.find({}, {sort: {username: +1}});
});
Meteor.publish("boards", function (space) {
   return Boards.find({space:space}, {sort: {title: +1}});
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
          var space = this.bodyParams.space;
          var statementEml = this.bodyParams.message;
          var username = this.bodyParams.author;
          var statementId = Random.id();
          var eml = stringToEml(statementEml, statementId, username , space);
          console.log(eml);
          return "OK";
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
  });

Meteor.methods({
	
	'addEmlStatement' : function(statementEml, username, space) {
		var statementId = Random.id();
		var eml = stringToEml(statementEml, statementId, username , space);
		addTask(eml);
	},
	'updateTask' : function(task) {
		updateTask(task);
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
			response.forEach(function(board){
				Boards.update({id:board.id},board, { upsert: true } );
			});
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
		var subject = author+' assigned you the task "'+task.statement+'"';
		var notification = {'from':author, 'to':username, 'link':'','subject':subject, 'picture':picture};
		Bus.sendNotification(notification, Meteor.settings.private.integrationBusPath);
	});
}

var updateTask = function(task){
	var oldTask = Tasks.findOne({
		eml_id: task.eml_id
	});
	task._id = oldTask._id;
	
	//Update the task
	Tasks.update(task._id, task);
	
	var oldUsers = oldTask.users;
	var users = task.users;

	//Send notification to new users added to the task
	users.forEach(function(username){
		if(oldUsers.indexOf(username)<0){
			var author = task.author;
			var picture = Meteor.settings.private.talkPath + "/avatar/"+author+".jpg";
			var subject = author+' assigned you the task "'+task.statement+'"';
			var notification = {'from':author, 'to':username, 'link':'','subject':subject, 'picture':picture};
			Bus.sendNotification(notification, Meteor.settings.private.integrationBusPath);
		}
	});
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
