Meteor.publish("boards", function (username) {
   return Boards.find({"username":username}, {sort: {title: +1}});
});

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
					//addActivity(statementEml, username, space);
					var obj = parseActivity(activity);
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
		var obj = parseActivity(activity);
		if(obj!=null){
			Activities.insert(obj);
		}
	},
	'updateActivity': function(_id, activity){
		var obj = parseActivity(activity);
		if(obj!=null){
			Activities.update(_id, obj);
		}
	},
	'refreshUserProjects' : function(username){
		this.unblock();
		var apiUrl = Meteor.settings.private.integrationBusPath + '/getUserProjects?username='+encodeURIComponent(username);
		var response = Meteor.wrapAsync(apiCall)(apiUrl);
		if(response!=null){
			response.forEach(function(project){
				project.username = username;
				var boardSpace = BoardSpaces.findOne({"id":project.space});
				if(boardSpace==null){
					console.log("not found");
					var spacesUrl = Meteor.settings.private.integrationBusPath + '/getSpaceInfo?spaceid='+encodeURIComponent(project.space);
					var bSpace = Meteor.wrapAsync(apiCall)(spacesUrl);
					console.log(bSpace);
					BoardSpaces.update({id:bSpace.id},bSpace, { upsert: true } )
				}
				Boards.update({id:project.id, username: project.username},project, { upsert: true } )
			});
		}
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

var parseActivity = function(activity) {

	var obj = {
		days: '',
		hours: '',
		minutes: '',
		project: '',

		description: '',
		cmpId: null,
		cmpName: null,
		userId: activity.userId,
		userName: activity.userName,
		time: new Date()
	}

	if (activity._id) {
		obj._id = activity._id;
	}

	var regexpBoardDoubleQuote = /(#)\"(.*)\"/g;
	var regexpBoard = /(#)([^\s]*)/g;
	var regexDays = /\b([0-9]*)(d|D|day|days|DAY|DAYS|Day|Days)\b/g;
	var regexHours = /\b([0-9]*)(h|H|hour|hours|HOUR|HOURS|Hour|Hours)\b/g;
	var regexMinutes = /\b([0-9]*)(m|M|minute|minutes|MINUTE|MINUTES|Minute|Minutes)\b/g;
	
	var description = activity.statement;

	// set project
	var regexpBoardDoubleQuoteResult = regexpBoardDoubleQuote.exec(activity.statement);
	if (regexpBoardDoubleQuoteResult !== null) {
		obj.project = regexpBoardDoubleQuoteResult[2];
		description = description.replace(regexpBoardDoubleQuoteResult[1]+"\""+regexpBoardDoubleQuoteResult[2]+"\"", "");
	}
	else{
		var regexpBoardResult = regexpBoard.exec(activity.statement);
		if (regexpBoardResult !== null) {
			obj.project = regexpBoardResult[2];
			description = description.replace(regexpBoardResult[1]+regexpBoardResult[2], "");
		}
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

	obj.description=description.trim();
	
	var prj = Boards.findOne({title:obj.project});
	if(prj!=null){
		obj.cmpId=prj.space;
		console.log("searching space info: " + prj.space);
		var boardSpace = BoardSpaces.findOne({"id":Number(prj.space)});
		console.log(boardSpace);
		if(boardSpace!=null){
			obj.cmpName=boardSpace.title;
			
		}
		else{
			obj.cmpName="SPACE NOT FOUND!";
		}
		return obj;
	}
	return null;
}