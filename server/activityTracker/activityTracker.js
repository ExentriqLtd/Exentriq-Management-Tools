Meteor.startup(function() {

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

	Api.addRoute('addActivityEml', {
		authRequired: false
	}, {
		post: {
			roleRequired: [],
			action: function() {
				try {
					var space = this.bodyParams.space;
					var statementEml = this.bodyParams.message;
					var username = this.bodyParams.username;
					addActivity(statementEml, username, space);
					return {
						status: "success"
					};
				} catch (e) {
					console.err(e);
					return {
						status: "error"
					};
				}
			}
		}
	});
	
	Api.addRoute('spaces/:space/activities', {
		authRequired: false
	}, {
		get: {
			roleRequired: [],
			action: function() {
				try {
					var space = this.urlParams.space;
					var day = this.queryParams.day;
					var query = {"cmpId":space};
					if(day!=null){
						var start = moment(day).startOf('day').toDate();
						var end = moment(day).endOf('day').toDate();
						query.time={$gte: start, $lt: end};
					}
					var activities = Activities.find(query).fetch();
					return { status: "success", "activities": activities };
				} catch (e) {
					console.log(e);
					return {
						status: "error"
					};
				}
			}
		}
	});

});

Meteor.methods({
	'getSpaceInfo': function(spaceId){

		this.unblock();
		var apiUrl = Meteor.settings.private.integrationBusPath + '/getSpaceInfo?spaceid='+encodeURIComponent(spaceId);
		var response = Meteor.wrapAsync(apiCall)(apiUrl);
		return response;
	},
	'addActivityEml': function(activity) {
		addActivity(activity);
	},
	'updateActivity': function(activity){
		Activities.update(activity._id, activity);
	},
	'refreshUserProjects' : function(username){
		var apiUrl = Meteor.settings.private.integrationBusPath + '/getUserProjects?username='+encodeURIComponent(username);
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

var addActivity = function(activity) {

	var obj = {
		days: '',
		hours: '',
		minutes: '',
		project: '',

		description: '',
		cmpId: activity.cmpId,
		cmpName: activity.cmpName,
		userId: activity.userId,
		userName: activity.userName,
		time: new Date()
	}

	var regexpBoard = /(#)([^\s]*)/g;
	var regexDays = /\b([0-9]*)(d|D|day|days|DAY|DAYS|Day|Days)\b/g;
	var regexHours = /\b([0-9]*)(h|H|hour|hours|HOUR|HOURS|Hour|Hours)\b/g;
	var regexMinutes = /\b([0-9]*)(m|M|minute|minutes|MINUTE|MINUTES|Minute|Minutes)\b/g;
	
	var description = activity.statement;

	// set project
	var regexpBoardResult = regexpBoard.exec(activity.statement);
	if (regexpBoardResult !== null) {
		obj.project = regexpBoardResult[2];
		description = description.replace(regexpBoardResult[1]+regexpBoardResult[2], "");
	}

	// set days
	var regexDaysResult = regexDays.exec(activity.statement);
	if (regexDaysResult !== null) {
		obj.days = Number(regexDaysResult[1]);
		description = description.replace(regexDaysResult[1]+regexDaysResult[2], "");
	} else {
		obj.days = 0;
	}

	// set hours
	var regexHoursResult = regexHours.exec(activity.statement);
	if (regexHoursResult !== null) {
		obj.hours = Number(regexHoursResult[1]);
		description = description.replace(regexHoursResult[1]+regexHoursResult[2], "");
	} else {
		obj.hours = 0;
	}

	// set minutes
	var regexMinutesResult = regexMinutes.exec(activity.statement);
	if (regexMinutesResult !== null) {
		obj.minutes = Number(regexMinutesResult[1]);
		description = description.replace(regexMinutesResult[1]+regexMinutesResult[2], "");
	} else {
		obj.minutes = 0;
	}

	obj.description=description;
	
	Activities.insert(obj);
}

var stringToEml = function(activity) {
	try {

		var statement = activity.statement;
		var id = activity.id;
		var user = activity.user;
		var cmpId = activity.cmpId;

		var result = {};
		var regexpBoard = /#([^\s]*)/g;
		var regexDays = /\b([0-9]*)(d|D|day|days|DAY|DAYS|Day|Days)\b/g;
		var regexHours = /\b([0-9]*)(h|H|hour|hours|HOUR|HOURS|Hour|Hours)\b/g;
		var regexMinutes = /\b([0-9]*)(m|M|minute|minutes|MINUTE|MINUTES|Minute|Minutes)\b/g;

		var regexpBoardResult = regexpBoard.exec(statement);
		if (regexpBoardResult !== null) {
			result.board = regexpBoardResult[1];
		}
		var regexDaysResult = regexDays.exec(statement);
		if (regexDaysResult !== null) {
			result.days = Number(regexDaysResult[1]);
		} else {
			result.days = 0;
		}
		var regexHoursResult = regexHours.exec(statement);
		if (regexHoursResult !== null) {
			result.hours = Number(regexHoursResult[1]);
		} else {
			result.hours = 0;
		}
		var regexMinutesResult = regexMinutes.exec(statement);
		if (regexMinutesResult !== null) {
			result.minutes = Number(regexMinutesResult[1]);
		} else {
			result.minutes = 0;
		}
		result.seconds = result.days * 28800 + result.hours * 3600 + result.minutes * 60;

		result.user = user;
		result.eml_id = id;
		result.project = project;
		result.activity = statement;
		result.time = new Date();
		return result;
	} catch (err) {
		console.log(err);
		return null;
	}
	return msg;
}