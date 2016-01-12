if (Meteor.isServer) {

	Meteor.publish('spaces', function() {
		var data = Spaces.find();
		if (data) {
			return data;
		} else return this.ready();
	});

	Meteor.publish('ordering', function() {

		var data = Ordering.find();
		if (data) {
			return data;
		} else return this.ready();
	});

	Meteor.publish('activities', function() {

		var data = Activities.find();
		if (data) {
			return data;
		} else return this.ready();
	});	
}

if (Meteor.isClient) {

	
}