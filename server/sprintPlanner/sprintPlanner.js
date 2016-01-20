Meteor.publish("tasks", function (space) {
   return Tasks.find({space:space});
});
Meteor.publish("appUsers", function () {
   return AppUsers.find({});
});
Meteor.publish("boards", function () {
   return Boards.find({});
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
  });

Meteor.methods({
	
	'addEmlStatement' : function(statementEml, username, space) {
		var statementId = Random.id();
		var eml = stringToEml(statementEml, statementId, username , space);
		Tasks.insert(eml);
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

var stringToEml = function(statement, id, author, space){
	eml = Eml.parse(statement);
	eml.what_and_why=statement;
	//In SprintPlanner projects ar called boards
	eml.board=eml.project;
	eml.author=author;
	eml.eml_id=id;
	eml.space=space;
	return eml;
}
