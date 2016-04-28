localStorage.setItem("MeteorLoginStatus", "halted");

function ensureLoggedIn(sessionToken) {
    localStorage.setItem("MeteorLoginStatus", "in-progress");
    return Meteor.call('verifyToken', sessionToken, function(error, result) {
        var userData;
        if (error) {
			console.log("ERROR");
			console.log(error);
            return;
        }
        userData = result;
		console.log("Result ensureLoggedIn");
		console.log(userData);
        if (userData !== null) {
			if(Meteor.user() != null && Meteor.user().username != userData.username){
				var htmlLoader = '<div class="loader-box" style="z-index:-1"><div style="text-align:center"> <i class="mdi mdi-autorenew loader icon"></i> </div> </div>';
				$("body").html(htmlLoader);
				console.log("Effettuo il logout");
				Meteor.logout(function(){
					console.log("Effettuo la login " + userData.username);
					MYLoginWithPassword(userData.username, 'exentriq', function(error){
						location.reload(true);
					});
				});
			}else{
				Meteor.loginWithPassword(userData.username, 'exentriq', function(error){})
			}
        } else {
            console.log('Invalid token, please contact administrator');
        }
        return localStorage.setItem("MeteorLoginStatus", "halted");
    });
}

function handleLogin(context) {
	var sessionToken;
    sessionToken = context.queryParams.sessionToken || localStorage.getItem('MeteorLoginSessionToken');

	var channelUrl = EqApp.client.site.channel_url() || Session.get('currentChannel');
	console.log("ChannelUrl=" + channelUrl);
	Session.set('currentChannel', channelUrl);

	if (localStorage.getItem("MeteorLoginStatus") === "halted") {
        if (sessionToken) {
            if (Meteor.userId()) {
                if (sessionToken !== localStorage.getItem('MeteorLastSessionToken')) {
                    Session.set('sessionToken', sessionToken);
                    localStorage.setItem('MeteorLastSessionToken', sessionToken);
                    ensureLoggedIn(sessionToken);
                }
                else {
					//FlowRouter.go(FlowRouter.current().path);
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
		if(!EqApp.client.site.is_cordova()){
            window.location.href = Meteor.settings.public.loginFormPath;
        } else {
            // Got to login
            FlowRouter.go('/login');
        }
	}
}

function isLoggedCallback(ready){

	if (!Meteor.loggingIn() && Meteor.userId()){
		ready && ready();	
	}
	else {
		var i = 0;
		var _interval = setInterval(function(){
			console.log("Check " + Meteor.loggingIn() + " " + Meteor.userId());
			if (!Meteor.loggingIn() && Meteor.userId()){
				ready && ready();	
				_interval && clearInterval(_interval);
			}
			if (i > 20) {
				_interval && clearInterval(_interval);
			}
		}, 100);
	}
}

// Login
FlowRouter.route('/login', {
    action: function(params, queryParams) {
        $('body').addClass('tp_login');
        BlazeLayout.render('appView', {
            center: "login"
        });
    }
});

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
		isLoggedCallback(function(){
			if (params.companyId) {
				Template.sprintPlanner.render({
					cmpId: params.companyId
				});
				BlazeLayout.render('appView', {
					center: "sprintPlanner"
				});
			}
		});
	}
});

FlowRouter.route('/activitytracker/:companyId', {
	action: function(params, queryParams) {   

		isLoggedCallback(function(){
			console.log("Run Action " + FlowRouter.current().path);
			if (params.companyId) {
				Meteor.call('getSpaceInfo', params.companyId, function(error, data) {
					if (!error) {
						// set session cmp
						Session.set('cmp', {
							cmpId: params.companyId,
							cmpName: data.title
						});

						// render tpl
						Template.activityTracker.render();
						BlazeLayout.render('appView', {
							center: "activityTracker"
						});
					}
				});
			}
		});
	}
});

FlowRouter.route('/activitytracker/user/:userId', {
	action: function(params, queryParams) {

		isLoggedCallback(function() {
			if (params.userId) {
				// set session user
				Session.set('user', {
					userName: params.userId == 'me' ? Meteor.user().username : null,
					userId: params.userId == 'me' ? Meteor.userId() : params.userId
				});

				// render tpl
				Template.activityTracker.render();
				BlazeLayout.render('appView', {
					center: "activityTracker"
				});
			}
		});
	}
});

FlowRouter.route('/activitytracker/:companyId/project/:project', {
	action: function(params, queryParams) {

		isLoggedCallback(function() {
			if (params.companyId && params.project) {
				Meteor.call('getSpaceInfo', params.companyId, function (error, data) {
					if (!error) {
						// set session cmp
						Session.set('cmp', {
							cmpId: params.companyId,
							cmpName: data.title
						});

						// set session user
						Session.set('project', params.project);

						// render tpl
						Template.activityTracker.render();
						BlazeLayout.render('appView', {
							center: "activityTracker"
						});
					}
				});
			}
		});
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

// Root Web
if(!EqApp.client.site.is_cordova()){
    FlowRouter.route('/', {
        action: function(params, queryParams) {

        }
    });
}

MYLoginWithPassword = function (selector, password, callback) {
	selector = {username: selector};
	Meteor.logout()

	Accounts.callLoginMethod({
		methodArguments: [{
			user: selector,
			password: Accounts._hashPassword(password)
		}],
		userCallback: function (error, result) {
			if (error && error.error === 400 &&
					error.reason === 'old password format') {
				// The "reason" string should match the error thrown in the
				// password login handler in password_server.js.

				// XXX COMPAT WITH 0.8.1.3
				// If this user's last login was with a previous version of
				// Meteor that used SRP, then the server throws this error to
				// indicate that we should try again. The error includes the
				// user's SRP identity. We provide a value derived from the
				// identity and the password to prove to the server that we know
				// the password without requiring a full SRP flow, as well as
				// SHA256(password), which the server bcrypts and stores in
				// place of the old SRP information for this user.
				srpUpgradePath({
					upgradeError: error,
					userSelector: selector,
					plaintextPassword: password
				}, callback);
			}
			else if (error) {
				callback && callback(error);
			} else {
				callback && callback();
			}
		}
	});
};
