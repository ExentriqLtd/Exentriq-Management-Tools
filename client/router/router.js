FlowRouter.route('/orgmanager/:companyId', {
	action: function(params, queryParams) {   
		if (params.companyId){
			Template.mainView.render({cmpId: params.companyId});
			BlazeLayout.render('appView', { center: "mainView" });
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

FlowRouter.route('/', {
	action: function(params, queryParams) {   
		
	}
});

