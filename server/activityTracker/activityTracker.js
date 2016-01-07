Meteor.publish("activities", function (space) {
   return Activities.find({space:space});
});

Meteor.startup(function () {
    // Global configuration
    Api = new Restivus({
      version: 'v1',
      useDefaultAuth: true,
      prettyJson: true,
      apiPath: 'activitytracker/api/'
    });
 
    // Generates: GET/POST on activitytracker/api/v1/activities, and GET/PUT/DELETE on activitytracker/api/v1/activities/:id 
    // for Mongo.Collection("Activities") collection
    Api.addCollection(Activities);
    
    Api.addRoute('addActivityEml', {authRequired: false}, {
        post: {
          roleRequired: [],
          action: function () {
        	  try {
        		  var space = this.bodyParams.space;
                  var statementEml = this.bodyParams.message;
                  var username = this.bodyParams.username;
                  addActivity(statementEml, username, space);
                  return {status: "success"};
				} catch (e) {
					console.err(e);
					return {status: "error"};
				}
          }
        }
      });

  });

Meteor.methods({
	
	'addActivityEml' : function(activityEml, username, space) {
		addActivity(activityEml, username, space);
	}
});

var addActivity = function(activityEml, username, space){
	var activityEmlId = Random.id();
	var eml = stringToEml(activityEml, activityEmlId, username, space);
	console.log(eml);
	Activities.insert(eml);
}

var stringToEml = function(statement, id, user, space){
	try{
	    
	    var result ={};
	    var regexpBoard = /#([^\s]*)/g;
	    var regexDays = /\b([0-9]*)(d|D|day|days|DAY|DAYS|Day|Days)\b/g;
	    var regexHours = /\b([0-9]*)(h|H|hour|hours|HOUR|HOURS|Hour|Hours)\b/g;
	    var regexMinutes = /\b([0-9]*)(m|M|minute|minutes|MINUTE|MINUTES|Minute|Minutes)\b/g;
	    
	    var regexpBoardResult = regexpBoard.exec(statement);
	    if(regexpBoardResult!==null){
	        result.board=regexpBoardResult[1];
	    }
	    var regexDaysResult = regexDays.exec(statement);
	    if(regexDaysResult!==null){
	        result.days=Number(regexDaysResult[1]);
	    }
	    else{
	    	result.days = 0;
	    }
	    var regexHoursResult = regexHours.exec(statement);
	    if(regexHoursResult!==null){
	        result.hours=Number(regexHoursResult[1]);
	    }
	    else{
	    	result.hours=0;
	    }
	    var regexMinutesResult = regexMinutes.exec(statement);
	    if(regexMinutesResult!==null){
	        result.minutes=Number(regexMinutesResult[1]);
	    }
	    else{
	    	result.minutes=0;
	    }
	    result.seconds = result.days*28800 + result.hours*3600 + result.minutes*60;

	    result.user=user;
	    result.eml_id=id;
	    result.space=space;
	    result.activity=statement;
	    result.time=new Date();
	    return result;
	}
	catch(err){
		console.log(err);
	    return null;
	}
	return msg;
}