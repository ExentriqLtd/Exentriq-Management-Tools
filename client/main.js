if (Meteor.isServer) {

	Meteor.publish('spaces', function() {

		observeSunbscription(this, 'spaces', function() {
			return Spaces.find();
		});
	});
}

if (Meteor.isClient) {

	Meteor.subscribe('spaces');

	Template.circleView.helpers({
		spaces: function() {
			return Spaces.find();
		}
	});

	var _win = $(window);
	var root = $('.organization-manager');

	Template.treeView.onChange(function() {

		var m = Template.treeView.getModel();
		Template.circleView.setModel(m);
	});

	_win.resize(function() {

		if (_win.width() < 600) {
			root.addClass('small');
		} else {
			root.removeClass('small');
			model = Template.treeView.getModel();
			Template.circleView.setModel(model);
		}
	});
}