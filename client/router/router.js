FlowRouter.route('/orgmanager/:companyId', {
	action: function(params, queryParams) {   
		if (params.companyId){
			Template.mainView.render({cmpId: params.companyId});	
		}
	}
});

FlowRouter.route('/', {
	action: function(params, queryParams) {   
		
	}
});

