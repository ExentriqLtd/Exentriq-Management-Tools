FlowRouter.route('/orgmanager/:companyId', {
	action: function(params, queryParams) {   
		if (params.companyId){
			Template.orgManager.render({cmpId: params.companyId});
			BlazeLayout.render('appView', { center: "orgManager" });
		}
	}
});

FlowRouter.route('/sprintplanner/:companyId', {
	action: function(params, queryParams) {   

		console.log(params.companyId);
		if (params.companyId){
			Template.sprintPlanner.render({cmpId: params.companyId});
			BlazeLayout.render('appView', { center: "sprintPlanner" });
		}
	}
});

FlowRouter.route('/activitytracker/:companyId', {
	action: function(params, queryParams) {   

		console.log(params.companyId);
		if (params.companyId){
			Template.activityTracker.render({cmpId: params.companyId});
			BlazeLayout.render('appView', { center: "activityTracker" });
		}
	}
});

FlowRouter.route('/', {
	action: function(params, queryParams) {   
		
	}
});

