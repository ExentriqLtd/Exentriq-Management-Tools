Meteor.methods({
	getSpaces: function(spaceId) {
		check(spaceId, String);
		// Try to retrieve user data from auth API
		var result = HTTP.call('POST', 'http://stage.exentriq.com/JSON-RPC', {
			data: {
				id: '7',
				method: 'spaceService.getSpacesInChannel',
				params: ["", "", "ALL", 0, 30]
			}
		});
		var spaces = result.data.result;
		if (spaces != null) {
			// In any case, as long as we got a response from the auth API, just return this user data
			return spaces;
		}
		// No user was retrieved from the auth API
		return null;
	},

});