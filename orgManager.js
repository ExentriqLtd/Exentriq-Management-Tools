Meteor.orgmanagerApp = function() {

	var _interval;
	var ordering;
	var _win = $(window);
	_win.resize(function() {

		if (_win.width() < 600) {
			root.addClass('small');
		} else {
			root.removeClass('small');
			model = Template.treeView.getModel();
			Template.circleView.setModel(model);
		}
	});
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
					type: i.type,
					position: getPoitionById(i._id),
					children: getChildrensFor(i).sort(sortByPosition)
				};
			}).sort(sortByPosition);
	}

	function sortByPosition(a, b) {
		if (a.position > b.position) {
			return 1;
		}
		if (a.position < b.position) {
			return -1;
		}
		return 0;
	}

	function getPoitionById(_id) {

		var p = 0;
		if (ordering && ordering.ordering) {

			ordering.ordering.forEach(function(i) {

				if (i._id == _id) {
					p = i.position;
				}
			});
			return p;
		} else return 0;
	}

	function setModel() {

		clearInterval(_interval);
		Template.treeView.setModel(Template.treeView.organizationManagerModel);
		Template.circleView.setModel(Template.treeView.organizationManagerModel);
	}

	function convertNode(allSpaces) {

		return allSpaces
			.filter(function(space) {
				return !space.parent;
			})
			.map(function(space) {
				if (!space.parent) {
					return {
						_id: space._id,
						name: space.name,
						type: space.type,
						children: getChildrensFor(space),
						position: getPoitionById(space._id)
					};
				}
			}).sort(sortByPosition)
	}

	function run(_param) {

		var param = $.extend({
			cmpId: ''
		}, _param);

		var cmpId = param.cmpId;

		Meteor.subscribe("ordering", {
			onReady: function() {
				ordering = Ordering.find({cmpId: cmpId}).fetch()[0] || null;
				Meteor.subscribe("spaces", {
					onReady: function() {

						Template.treeView.organizationManagerModel.children = convertNode(Spaces.find({cmpId: cmpId}).fetch());
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

		var query = Spaces.find({cmpId: cmpId});
		var handle = query.observeChanges({
			added: function(id, data) {

				Template.treeView.organizationManagerModel.children = convertNode(Spaces.find({cmpId: cmpId}).fetch());
				Template.treeView.renderDone &&
					Template.circleView.renderDone &&
					setModel();
			},
			removed: function(id, data) {
				Template.treeView.organizationManagerModel.children = convertNode(Spaces.find({cmpId: cmpId}).fetch());
				Template.treeView.renderDone &&
					Template.circleView.renderDone &&
					setModel();

			}
		});

		Template.treeView.organizationManagerModel.children = [];
		Template.treeView.onChange(function() {

			// save ordering
			ordering = Template.treeView.getOrdering();

			if (!Ordering.find({cmpId: cmpId}).fetch().length) {
				Ordering.insert({
					ordering: ordering
				});
			} else {
				var firstId = Ordering.find({cmpId: cmpId}).fetch()[0]._id;
				Ordering.update({
					_id: firstId
				}, {
					ordering: ordering
				});
			}

			ordering = Ordering.find({cmpId: cmpId}).fetch()[0];
			Template.treeView.organizationManagerModel.children = convertNode(Spaces.find({cmpId: cmpId}).fetch());

			// set new model to templates
			//Template.treeView.setModel(Template.treeView.organizationManagerModel);
			Template.circleView.setModel(Template.treeView.organizationManagerModel);
		});
	}

	return {
		run: run
	}
}