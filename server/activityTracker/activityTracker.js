Meteor.publish("userBoards", function (username, company) {
	var filter = {"username":username};
	if(company!==null){
		filter.space=company.cmpId;
	}
	return UserBoards.find(filter, {sort: {title: +1}});
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
	//Api.addCollection(Activities);

	Api.addRoute('addActivityEml', {
		authRequired: false
	}, {
		post: {
			roleRequired: [],
			action: function() {
				try {
					var statementEml = this.bodyParams.message;
					var username = this.bodyParams.username;
					console.log(statementEml);
					console.log(username);
					var activity = {"userName":username, "statement":statementEml};
					var obj = parseActivity(activity);
					if(obj!=null){
						if(obj.days==0 && obj.hours==0 && obj.minutes==0){
							return { status: "error", message:"no time logged. You have to add something like this: 1h 30m" };
						}
						
						Activities.insert(obj);
						return {status: "success" };
					}
					return { status: "error", message:"I did no understand what you just wrote... Type something like this: 2h 30m #project did something serious" };
				} catch (e) {
					console.error(e);
					return { status: "error", message: "generic error"};
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
	
	Api.addRoute('activities', {
		authRequired: false
	}, {
		get: {
			roleRequired: [],
			action: function() {
				try {
					var day = this.queryParams.day;
					var query = {};
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
	'getUserInSpace' : function(spaceId){
		this.unblock();
		var apiUrl = Meteor.settings.private.integrationBusPath + '/getAllUsers?spaceid='+encodeURIComponent(spaceId);
		var response = Rest.get(apiUrl);
		return response;
	},
	'getSpaceInfo': function(spaceId){

		this.unblock();
		var apiUrl = Meteor.settings.private.integrationBusPath + '/getSpaceInfo?spaceid='+encodeURIComponent(spaceId);
		var response = Rest.get(apiUrl);
		return response;
	},
	'addActivityEml': function(activity) {
		var obj = parseActivity(activity);
		console.log('OBJ');
		console.log(obj);
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
		var response = Rest.get(apiUrl);
		if(response!=null){
			response.forEach(function(project){
				project.username = username;
				project.spaceTitle = null;
				var boardSpace = BoardSpaces.findOne({"id":project.space});
				if(boardSpace==null){
					var spacesUrl = Meteor.settings.private.integrationBusPath + '/getSpaceInfo?spaceid='+encodeURIComponent(project.space);
					var bSpace = Rest.get(spacesUrl);
					
					if(bSpace!=null){
						project.spaceTitle=bSpace.title;
						BoardSpaces.update({id:bSpace.id},bSpace, { upsert: true } );
					}
				}
				if(project.spaceTitle == null || typeof project.spaceTitle == 'undefined'){
					project.spaceTitle="SPACE NOT FOUND!";
				}
				UserBoards.update({id:project.id, username: project.username},project, { upsert: true } )
			});
		}
	}
});

var parseActivity = function(activity) {
	eml = Eml.parse(activity.statement);
	eml.description = eml.clean;
	eml.userId	= activity.userId;
	eml.userName = activity.userName;

	if(activity.hasOwnProperty('time')){
		eml.time = moment(activity.time, "MM-DD-YYYY").toDate();
	}
	else {
		eml.time = new Date();
	}
	if (activity._id) {
		eml._id = activity._id;
	}
	
	var filter = {title:eml.project};
	if(eml.cmpName != null || typeof eml.cmpName != 'undefined'){
		filter.spaceTitle=eml.cmpName;
	}
	var prj = UserBoards.findOne(filter);
	if(prj!=null){
		eml.prjId = prj.id;
		eml.cmpId=prj.space;
		eml.cmpName = prj.spaceTitle;
		return eml;
	}
	else{
		return null;
	}
}