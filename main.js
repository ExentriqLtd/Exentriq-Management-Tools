if (Meteor.isServer) {

	Meteor.publish('spaces', function(request) {
		var data = Spaces.find(request);
		if (data) {
			return data;
		} else return this.ready();
	});

	Meteor.publish('ordering', function(request) {

		var data = Ordering.find(request);
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