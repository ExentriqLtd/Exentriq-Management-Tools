if (Meteor.isServer) {

	Meteor.publish('spaces', function() {
		this.ready();
		return Spaces.find({});
	});
}

if (Meteor.isClient) {

	var _win = $(window);
	var root = $('.organization-manager');

	Tracker.autorun(function() {
		
		Meteor.subscribe("spaces", {
		  onReady: function () { console.log("onReady And the Itemns actually Arrive", arguments); },
		  onError: function () { console.log("onError", arguments); }
		});

		var allSpaces = Spaces.find({});
		console.log('allSpaces');
		console.log(allSpaces);
	});
	
	function getChildrensFor(parent) {

		return Spaces.find({
				parent: parent._id
			})
			.fetch()
			.filter(function(i) {
				return i.parent !== null
			})
			.map(function(i) {
				return {
					_id: i._id,
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