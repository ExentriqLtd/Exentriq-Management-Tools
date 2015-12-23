if (Meteor.isServer) {

	var s = Meteor.publish('spaces', function() {
		var data = Spaces.find({});
		if (data) {
			return data;
		} else return this.ready();
	});

	Meteor.publish('ordering', function() {

		var data = Ordering.find({});
		if (data) {
			return data;
		} else return this.ready();
	});
}

if (Meteor.isClient) {

	
}