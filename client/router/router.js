FlowRouter.route('/:companyId', {
	action: function(params, queryParams) {   

		console.log(params.companyId);
		if (params.companyId){
			Template.mainView.render({cmpId: params.companyId});	
		}
	}
});

FlowRouter.route('/', {
	action: function(params, queryParams) {   
		
	}
});

