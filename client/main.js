if (Meteor.isServer) {

	Meteor.publish('spaces', function() {
		this.ready();
		return Spaces.find();
	});
}

if (Meteor.isClient) {

	var _win = $(window);
	var root = $('.organization-manager');

	Meteor.subscribe('spaces');

	Template.treeView.organizationManagerModel.children = [];
	Spaces.find({}).fetch().forEach(function(space) {
		Template.treeView.organizationManagerModel.children.push({
			type: 'space',
			name: space.name,
			size: 50,
			children: []
		});
	});
	
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