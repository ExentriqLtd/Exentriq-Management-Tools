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

	var allSpaces = Spaces.find({}).fetch();

	function getChildrensFor(parent) {

		console.log(parent._id._str);
		console.log(Spaces.find({ parent: parent._id._str }).fetch());

		return Spaces.find({
			parent: parent._id._str
		}).fetch().map(function(i) {
			return {
				_id: i._id._str,
				name: i.name,
				type: 'space',
				children: getChildrensFor(i)
			};
		});
	}

	Template.treeView.organizationManagerModel.children = [];
	allSpaces.forEach(function(space) {
		if (space.parent === null) {
			Template.treeView.organizationManagerModel.children.push({
				_id: space._id,
				name: space.name,
				type: 'space',
				children: getChildrensFor(space)
			});
		}
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