Tasks = new Mongo.Collection("tasks");
UsersTest = new Mongo.Collection("users_test");
BoardsTest = new Mongo.Collection("boards_test");

Meteor.publish("tasks", function (space) {
   return Tasks.find({space:space});
});
Meteor.publish("users_test", function (space) {
   return UsersTest.find({});
});
Meteor.publish("boards_test", function (space) {
   return BoardsTest.find({});
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
//          if (article) {
//            return {status: "success", data: article};
//          }
//          return {
//            statusCode: 400,
//            body: {status: "fail", message: "Unable to add article"}
//          };
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
	
	'getTasks' : function(username, space, team) {
		// avoid blocking other method calls from the same client
		this.unblock();
		var apiUrl = 'http://bus.stage.exentriq.com:1880/getEmlTasks?space='+encodeURIComponent(space)+'&team='+encodeURIComponent(team);
		// asynchronous call to the dedicated API calling function
		var response = Meteor.wrapAsync(apiCall)(apiUrl);
		return response;
	},
	'addEmlStatementOld' : function(username, space, team, statementId, statementEml){
		this.unblock();
		var apiUrl = 'http://bus.stage.exentriq.com:1880/addEmlStatement';
		var response = Meteor.wrapAsync(apiCallPost)(apiUrl, username, space, team, statementId, statementEml);
		return response;
	},
	'deleteEmlTask' : function(username, space, team, statementId, statementEml){
		this.unblock();
		var apiUrl = 'http://bus.stage.exentriq.com:1880/deleteEmlTask';
		var response = Meteor.wrapAsync(apiCallPost)(apiUrl, username, space, team, statementId, statementEml);
		return response;
	},
	'getTeams' : function(space){
		// avoid blocking other method calls from the same client
		this.unblock();
		var apiUrl = 'http://bus.stage.exentriq.com:1880/getTeams?space='+space;
		// asynchronous call to the dedicated API calling function
		var response = Meteor.wrapAsync(apiCall)(apiUrl);
		return response;
	}
});

var apiCall = function (apiUrl, callback) {
  // try…catch allows you to handle errors 
  try {
    var response = HTTP.get(apiUrl).data;
    // A successful API call returns no error 
    // but the contents from the JSON responseif 
    callback(null, response);
  } catch (error) {
    // If the API responded with an error message and a payload 
    if (error.response) {
      var errorCode = error.response.data.code;
      var errorMessage = error.response.data.message;
    // Otherwise use a generic error message
    } else {
      var errorCode = 500;
      var errorMessage = 'Cannot access the API';
    }
    // Create an Error object and return it via callback
    var myError = new Meteor.Error(errorCode, errorMessage);
    callback(myError, null);
  }
}

var apiCallPost = function (apiUrl, username, space, team, statementId, statementEml, callback) {
	  // try…catch allows you to handle errors 
	 console.log('post...');
	  try {
		  HTTP.call( 'POST', apiUrl, {
			  data: {"id":statementId, "author":username, "space":space, "team":team, "message":statementEml}
			}, function( error, response ) {
			  if ( error ) {
			    callback(error, null);
			  } else {
			    callback(null, response.data);
			  }
			});
		  console.log('post done');
	  } catch (error) {
		  console.log(error);
	    // If the API responded with an error message and a payload 
	    if (error.response) {
	      var errorCode = error.response.data.code;
	      var errorMessage = error.response.data.message;
	    // Otherwise use a generic error message
	    } else {
	      var errorCode = 500;
	      var errorMessage = 'Cannot access the API';
	    }
	    // Create an Error object and return it via callback
	    var myError = new Meteor.Error(errorCode, errorMessage);
	    callback(myError, null);
	  }
	}

var stringToEml = function(statement, id, author, space){
	try{
	    
	    var result ={};
	    var regexpUser = /@([^\s]*)/g;
	    var regexpBoard = /#([^\s]*)/g;
	    var regexpMilestone = /\s!([^\s]*)/g;
	    var regexpEta = /ETA([^\s]*)/g;
	    var regexpEffort = /~([^\s]*)/g;
	    var regexpProgress = /%([^\s]*)/g;
	    var regexpPriority = /\[(.*)\]/g;
	    var regexpBudget = /\$([^\s]*)/g;
	    var regexpCard = /&([^\s]*)/g;
	    
	    var regexpUserResults; 
	    result.users = [];
	    while ((regexpUserResults = regexpUser.exec(statement)) !== null) {
	        result.users.push(regexpUserResults[1]);
	    }
	    var regexpBoardResult = regexpBoard.exec(statement);
	    if(regexpBoardResult!==null){
	        result.board=regexpBoardResult[1];
	    }
	    var regexpMilestoneResult = regexpMilestone.exec(statement);
	    if(regexpMilestoneResult!==null){
	        result.milestone=regexpMilestoneResult[1];
	    }
	    var regexpEtaResult = regexpEta.exec(statement);
	    if(regexpEtaResult!==null){
	        result.eta=regexpEtaResult[1];
	    }
	    var regexpEffortResult = regexpEffort.exec(statement);
	    if(regexpEffortResult!==null){
	        result.effort=regexpEffortResult[1];
	    }
	    var regexpProgressResult = regexpProgress.exec(statement);
	    if(regexpProgressResult!==null){
	        result.progress=regexpProgressResult[1];
	    }
	    var regexpPriorityResult = regexpPriority.exec(statement);
	    if(regexpPriorityResult!==null){
	        result.points=regexpPriorityResult[1];
	    }
	    var regexpBudgetResult = regexpBudget.exec(statement);
	    if(regexpBudgetResult!==null){
	        result.budget=regexpBudgetResult[1];
	    }
	    var regexpCardResult = regexpCard.exec(statement);
	    if(regexpCardResult!==null){
	        result.card=regexpCardResult[1];
	    }
	    result.author=author;
	    result.eml_id=id;
	    result.space=space;
	    result.what_and_why=statement;
	    return result;
	}
	catch(err){
		console.log(err);
	    return null;
	}
	return msg;
}