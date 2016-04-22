ExentriqPush = class
	register: (username) ->		
		unless Meteor.isCordova
			return
		console.log 'ExentriqPush: Registering ', username
		if device?.platform.toLowerCase() isnt 'android'
			cordova.exec (result)->
				Meteor.call 'sendIosTokenUsername', username, result
			,
				() ->
			, 'PushPlugin', 'getToken', []
		if device?.platform.toLowerCase() is 'android'
			Meteor.call 'sendAndroidTokenUsername', username, localStorage.getItem('androidToken')
			
ExPush = new ExentriqPush()