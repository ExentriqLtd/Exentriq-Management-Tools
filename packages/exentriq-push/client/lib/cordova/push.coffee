if Meteor.isCordova
	Push.addListener 'token', (token) ->
		if device?.platform.toLowerCase() is 'android'
			localStorage.setItem('androidToken', token.gcm)
			if Meteor.user()
				Meteor.call 'sendAndroidTokenUsername', Meteor.user().username, token.gcm

	Push.addListener 'startup', (notification) ->
		if notification.additionalData?.link?
			FlowRouter.go(notification.additionalData.link)