if (Meteor.isClient) {

	setTimeout(function() {
		var app = com.exentriq.organizationManager();
		app.getControl().appendTo($('body'));
		app.run();
	}, 1);
}