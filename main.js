if (Meteor.isServer) {

	Meteor.publish('spaces', function() {
		
		var data = Spaces.find({});
		if (data){
			return data;
		}
		else return this.ready();
	});
}

if (Meteor.isClient) {

	Meteor.subscribe("spaces", {
		onReady: function() {

			var allSpaces = Spaces.find({}).fetch();
			console.log('allSpaces');
			console.log(allSpaces);
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
		},
		onError: function() {
			// error spaces subscribe
		}
	});

	var _win = $(window);
	var root = $('.organization-manager');

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