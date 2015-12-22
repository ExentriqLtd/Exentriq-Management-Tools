FlowRouter.route('/orgmanager/:companyId', {
	action: function(params, queryParams) {   
		console.log("Params for D3JS:", params.companyId);

		var orgManager = Meteor.orgmanagerApp();
		orgManager.run({cmpId: params.companyId});
	}
});