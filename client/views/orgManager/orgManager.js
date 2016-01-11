'use strict';

Template.orgManager.render = function(_param) {

	var param = $.extend({
		cmpId: ''
	}, _param);

	var cmpId = param.cmpId;
	Template.orgManager._cmpId = cmpId;

	var _interval;
	var ordering;

	var _win = $(window);
	_win.resize(function() {

		var root = $('.organization-manager');
		var treeViewBlock = $('.row>.col-md-4');
		if (_win.width() < 992) {
			root.addClass('small show-tree');
		} else {
			root.removeClass('small show-tree show-circle');
			Template.circleView.setModel(Template.treeView.getModel());
		}
	});

	Meteor.subscribe("ordering", {
		onReady: function() {
			ordering = Ordering.find({
				cmpId: cmpId
			}).fetch()[0] || null;
			Meteor.subscribe("spaces", {
				onReady: function() {

					var query = Spaces.find({
						cmpId: cmpId
					});
					Template.treeView.organizationManagerModel.children = Template.orgManager.convertNode(query.fetch());
					_interval = setInterval(function() {

						if (Template.treeView.renderDone && Template.circleView.renderDone) {
							Template.orgManager.setModel(_interval);
							Template.orgManager.bindObserveChanges(query);

							var orderingQuery = Ordering.find({
								cmpId: cmpId
							});
							ordering = orderingQuery.fetch()[0];
							Template.orgManager.bindObserveChanges(orderingQuery);
						}
					}, 10);
				},
				onError: function() {
					// error spaces subscribe
				}
			});
		}
	});

	Template.treeView.organizationManagerModel.children = [];
	Template.treeView.onChange(function() {

		// save ordering
		ordering = Template.treeView.getOrdering();

		if (!Ordering.find({
				cmpId: cmpId
			}).fetch().length) {
			Ordering.insert({
				cmpId: cmpId,
				ordering: ordering
			});
		} else {
			var firstId = Ordering.find({
				cmpId: cmpId
			}).fetch()[0]._id;
			Ordering.update({
				_id: firstId
			}, {
				cmpId: cmpId,
				ordering: ordering
			});
		}

		var orderingQuery = Ordering.find({
			cmpId: cmpId
		});
		ordering = orderingQuery.fetch()[0];

		var query = Spaces.find({
			cmpId: cmpId
		});
		Template.treeView.organizationManagerModel.children = Template.orgManager.convertNode(query.fetch());
		Template.circleView.setModel(Template.treeView.organizationManagerModel);
	});
};

Template.orgManager.getChildrensFor = function(parent, _param) {

	return Spaces.find({
			parent: parent._id
		})
		.fetch()
		.filter(function(i) {
			return i.parent !== null
		})
		.map(function(i) {
			return $.extend(i, {
				selected: (_param && _param.selectedNodes.some(function(o) {
					return o == i._id;
				})) || false,
				expanded: (_param && _param.expandedNodes.some(function(o) {
					return o == i._id;
				})) || false,
				position: Template.orgManager.getPoitionById(i._id),
				children: Template.orgManager.getChildrensFor(i, _param).sort(Template.orgManager.sortByPosition)
			});
		}).sort(Template.orgManager.sortByPosition);
};

Template.orgManager.sortByPosition = function(a, b) {
	if (a.position > b.position) {
		return 1;
	}
	if (a.position < b.position) {
		return -1;
	}
	return 0;
};

Template.orgManager.getPoitionById = function(_id) {

	var p = 0;
	var orderingQuery = Ordering.find({
		cmpId: Template.orgManager._cmpId
	});
	var ordering = orderingQuery.fetch()[0];

	if (ordering && ordering.ordering) {

		ordering.ordering.forEach(function(i) {

			if (i._id == _id) {
				p = i.position;
			}
		});
		return p;
	} else return 0;
};

Template.orgManager.setModel = function(_interval) {

	_interval && clearInterval(_interval);
	Template.treeView.setModel(Template.treeView.organizationManagerModel, {
		allowSorting: true,
		allowMenu: true
	});
	Template.circleView.setModel(Template.treeView.organizationManagerModel);
	$(window).trigger('resize');
};

Template.orgManager.convertNode = function(allSpaces, _param) {

	return allSpaces
		.filter(function(space) {
			return !space.parent;
		})
		.map(function(space) {
			if (!space.parent) {
				return {
					_id: space._id,
					selected: (_param && _param.selectedNodes.some(function(i) {
						return i == space._id;
					})) || false,
					expanded: (_param && _param.expandedNodes.some(function(i) {
						return i == space._id;
					})) || false,
					cmpId: space.cmpId,
					id: space.id,
					name: space.name,
					type: space.type,
					children: Template.orgManager.getChildrensFor(space, _param),
					position: Template.orgManager.getPoitionById(space._id)
				};
			}
		}).sort(Template.orgManager.sortByPosition)
};

Template.orgManager.bindObserveChanges = function(query) {

	function ready() {

		if (!Template.orgManager._block) {
			var orderingQuery = Ordering.find({
				cmpId: Template.orgManager._cmpId
			});
			var ordering = orderingQuery.fetch()[0];
			Template.treeView.organizationManagerModel.children = Template.orgManager.convertNode(
				Spaces.find({
					cmpId: Template.orgManager._cmpId
				}).fetch(), {
					selectedNodes: $('.selected').toArray().map(function(i) {
						return $(i).data('item')._id || '';
					}),
					expandedNodes: $('.mjs-nestedSortable-expanded').toArray().map(function(i) {
						return $(i).data('item')._id || '';
					})
				}
			);

			Template.treeView.renderDone &&
				Template.circleView.renderDone &&
				Template.orgManager.setModel();
		}
	}

	query.observeChanges({
		changed: ready,
		added: ready,
		removed: ready
	});
};

Template.orgManager.updateSpace = function(item) {

	var obj = {
		cmpId: item.cmpId,
		name: item.name,
		parent: item.parent,
		type: item.type,
		id: item.id
	};

	Spaces.update({
		_id: item._id
	}, obj);
};

Template.orgManager.insertSpace = function(item) {

	var obj = {
		cmpId: item.cmpId,
		name: item.name,
		parent: item.parent,
		type: item.type,
		id: item.id
	};

	Spaces.insert(obj);
};

Template.orgManager.rendered = function() {

};