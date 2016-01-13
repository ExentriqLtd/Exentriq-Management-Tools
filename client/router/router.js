FlowRouter.route('/orgmanager/:companyId', {
	action: function(params, queryParams) {   
		if (params.companyId) {
			Template.orgManager.render({
				cmpId: params.companyId
			});
			BlazeLayout.render('appView', {
				center: "orgManager"
			});
		}
	}
});

FlowRouter.route('/sprintplanner/:companyId', {
	action: function(params, queryParams) {   
		if (params.companyId) {
			Template.sprintPlanner.render({
				cmpId: params.companyId
			});
			BlazeLayout.render('appView', {
				center: "sprintPlanner"
			});
		}
	}
});

FlowRouter.route('/activitytracker/:companyId', {
	action: function(params, queryParams) {   

		if (params.companyId) {
			Meteor.call('getSpaceInfo', params.companyId, function(error, data) {
				if (!error) {
					// set session cmp
					Session.set('cmp', {
						cmpId: params.companyId,
						cmpName: data.title
					});

					// set session user
					Session.set('user', {
						userName: 'kirill dubinin',
						userId: 'kirill dubinin'
					});

					// render tpl
					Template.activityTracker.render();
					BlazeLayout.render('appView', {
						center: "activityTracker"
					});
				}
			});
		}
	}
});

FlowRouter.route('/activitytracker/:companyId/project/:project', {
	action: function(params, queryParams) {   

		if (params.companyId && params.project) {

			Meteor.call('getSpaceInfo', params.companyId, function(error, data) {
				if (!error) {
					// set session cmp
					Session.set('cmp', {
						cmpId: params.companyId,
						cmpName: data.title
					});

					// set session user
					Session.set('user', {
						userName: 'kirill dubinin',
						userId: 'kirill dubinin'
					});

					// render tpl
					Template.activityTracker.render();
					BlazeLayout.render('appView', {
						center: "activityTracker"
					});
				}
			});
		}
	}
});

/*FlowRouter.route('/activitytracker/:companyId/project/:userId', {
	action: function(params, queryParams) {   

		console.log(params.companyId);
		if (params.companyId){

			Session.set('userId', params.projectId);
			Session.set('cmpId', params.projectId);

			Template.activityTracker.render({cmpId: params.companyId});
			BlazeLayout.render('appView', { center: "activityTracker" });
		}
	}
});
*/

FlowRouter.route('/', {
	action: function(params, queryParams) {   

	}
});