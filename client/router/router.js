localStorage.setItem("MeteorLoginStatus", "halted")

function ensureLoggedIn(sessionToken) {
    localStorage.setItem("MeteorLoginStatus", "in-progress");
    return Meteor.call('verifyToken', sessionToken, function(error, result) {
        var userData;
        if (error) {
            return;
        }
        userData = result;
        if (userData !== null) {
            Meteor.loginWithPassword(userData.username, 'exentriq', function(error) {
            });
        } else {
            console.log('Invalid token, please contact administrator');
        }
        return localStorage.setItem("MeteorLoginStatus", "halted");
    });
}

function handleLogin(context) {
    var sessionToken;
    sessionToken = context.queryParams.sessionToken;
    if (localStorage.getItem("MeteorLoginStatus") === "halted") {
        if (sessionToken) {
            if (Meteor.userId()) {
                if (sessionToken !== localStorage.getItem('MeteorLastSessionToken')) {
                    Session.set('sessionToken', sessionToken);
                    localStorage.setItem('MeteorLastSessionToken', sessionToken);
                    ensureLoggedIn(sessionToken);
                }
                else {
                    return
                }
            } else {
                Session.set('sessionToken', sessionToken);
                localStorage.setItem('MeteorLastSessionToken', sessionToken);
                ensureLoggedIn(sessionToken);
            }
        }
    }
    if (!Meteor.user() && !(localStorage.getItem("MeteorLoginStatus") === "in-progress")) {
        window.location.href = Meteor.settings.public.loginFormPath;
    }
}


FlowRouter.triggers.enter([handleLogin]);

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