Meteor.methods
	log: ->
		console.log.apply console, arguments
	sendIosTokenUsername: (username, deviceData) ->
		if typeof(deviceData) is 'object'
			console.log 'Token received:'
			console.log deviceData.token
			console.log 'Device ID received:'
			console.log deviceData.device
			console.log 'For username:'
			console.log username

			HTTP.call 'POST', Meteor.settings.private.integrationBusSetIosTokenPath, {
				data:
					username: username,
					token: deviceData.token,
					device: deviceData.device,
					app: Meteor.settings.private.notificationAppName
			},
				(error, result) ->
					if error
						console.log 'Error sending push params to integration bus'
		else if typeof(deviceData) is 'string'

			console.log 'Token received:'
			console.log deviceData
			console.log 'For username:'
			console.log username

			deviceData = deviceData.split("+");
			token = "";
			device = "";
			if(deviceData.length == 2)
				token = deviceData[0];
				device = deviceData[1];
			else
				token = deviceData[0];

			console.log 'Split Token:'
			console.log token
			console.log 'Split Device:'
			console.log device

			# Sync user unread messages on exentriq manager
			HTTP.call 'POST', Meteor.settings.private.integrationBusSetIosTokenPath, {
				data:
					username: username,
					token: token,
					device: device,
					app: Meteor.settings.private.notificationAppName
			},
				(error, result) ->
					if error
						console.log 'Error sending push params to integration bus'


	sendAndroidTokenUsername: (username, token) ->
		HTTP.call 'POST', Meteor.settings.private.integrationBusSetAndroidTokenPath, {
			data:
				username: username,
				token: token,
				app: Meteor.settings.private.notificationAppName
		},
			(error, result) ->
				if error
					console.log 'Error sending push params to integration bus'
				else
					console.log "Token send succesfully"

Meteor.startup ->
		Push.enabled = true
		Push.allow
			send: (userId, notification) ->
				return Meteor.users.findOne({_id: userId})?.admin is true
