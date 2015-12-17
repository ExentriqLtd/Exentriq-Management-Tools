if (Meteor.isServer) {

	Meteor.publish('spaces', function() {

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
					position: getPoitionById(i._id),
					children: getChildrensFor(i).sort(function(a, b) {
						if (a.position > b.position) {
							return 1;
						}
						if (a.position < b.position) {
							return -1;
						}
						return 0;
					})
				};
			});
	}

	function getPoitionById(_id){

		var p = 0;
		if (ordering && ordering.ordering){

			ordering.ordering.forEach(function(i){

				if (i._id._str == _id._str){
					p = i.position;
				}
			});
			return p;
		}
		else return 0;
	}

	var _interval;
	var ordering;
	function setModel() {

		clearInterval(_interval);
		Template.treeView.setModel(Template.treeView.organizationManagerModel);
		Template.circleView.setModel(Template.treeView.organizationManagerModel);
	}

	Meteor.subscribe("ordering", {
		onReady: function() {

			ordering = Ordering.find().fetch()[0] || null;

			Meteor.subscribe("spaces", {
				onReady: function() {

					var allSpaces = Spaces.find({}).fetch();

					// convert to UI items
					allSpaces.forEach(function(space) {
						if (!space.parent) {
							Template.treeView.organizationManagerModel.children.push({
								_id: space._id,
								name: space.name,
								type: 'space',
								children: getChildrensFor(space),
								position: getPoitionById(space._id)
							});
						}
					});

					// sort by position index
					Template.treeView.organizationManagerModel.children.sort(function(a, b) {
						if (a.position > b.position) {
							return 1;
						}
						if (a.position < b.position) {
							return -1;
						}
						return 0;
					})

					_interval = setInterval(function() {
						Template.treeView.renderDone &&
							Template.circleView.renderDone &&
							setModel();

					}, 10);
				},
				onError: function() {
					// error spaces subscribe
				}
			});
		}
	});

	var _win = $(window);
	var root = $('.organization-manager');

	Template.treeView.organizationManagerModel.children = [];
	Template.treeView.onChange(function() {

		// get new model
		Template.treeView.organizationManagerModel = Template.treeView.getModel();

		// save ordering
		var ordering = Template.treeView.getOrdering();
		if (!Ordering.find().fetch().length){
			Ordering.insert({ordering: ordering});
		}
		else {
			var firstId = Ordering.find().fetch()[0]._id;
			Ordering.update({_id: firstId}, { ordering: ordering });
		}

		// set new model to templates
		Template.treeView.setModel(Template.treeView.organizationManagerModel);
		Template.circleView.setModel(Template.treeView.organizationManagerModel);
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