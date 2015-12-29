'use strict';

Template.mainView.helpers({});
Template.mainView.events({});
Template.mainView.events({});

Template.mainView.render = function(_param) {

	var param = $.extend({
		cmpId: ''
	}, _param);

	var cmpId = param.cmpId;
	Template.mainView._cmpId = cmpId;

	var _interval;
	var ordering;
	var _win = $(window);
	_win.resize(function() {

		if (_win.width() < 600) {
			root.addClass('small');
		} else {
			root.removeClass('small');
			Template.circleView.setModel(Template.treeView.getModel());
		}
	});
	var root = $('.organization-manager');

	function getChildrensFor(parent, _param) {

		return Spaces.find({
				parent: parent._id
			})
			.fetch()
			.filter(function(i) {
				return i.parent !== null
			})
			.map(function(i) {
				return $.extend(i, {
					expanded: (_param && _param.expandedNodes.some(function(o) {
						return o == i._id;
					})) || false,
					position: getPoitionById(i._id),
					children: getChildrensFor(i).sort(sortByPosition)
				});
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

	function convertNode(allSpaces, _param) {

		return allSpaces
			.filter(function(space) {
				return !space.parent;
			})
			.map(function(space) {
				if (!space.parent) {
					return {
						_id: space._id,
						expanded: (_param && _param.expandedNodes.some(function(i) {
							return i == space._id;
						})) || false,
						cmpId: space.cmpId,
						name: space.name,
						type: space.type,
						children: getChildrensFor(space, _param),
						position: getPoitionById(space._id)
					};
				}
			}).sort(sortByPosition)
	}

	function bindObserveChanges(query) {

		function ready() {

			if (!Template.mainView._block) {
				var orderingQuery = Ordering.find({
					cmpId: cmpId
				});
				ordering = orderingQuery.fetch()[0];
				Template.treeView.organizationManagerModel.children = convertNode(
					Spaces.find({
						cmpId: cmpId
					}).fetch(), {
						expandedNodes: $('.mjs-nestedSortable-expanded').toArray().map(function(i) {
							return $(i).data('item')._id || '';
						})
					}
				);

				Template.treeView.renderDone &&
					Template.circleView.renderDone &&
					setModel();
			}
		}

		query.observeChanges({
			changed: ready,
			added: ready,
			removed: ready
		});
	}

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
					Template.treeView.organizationManagerModel.children = convertNode(query.fetch());
					_interval = setInterval(function() {

						if (Template.treeView.renderDone && Template.circleView.renderDone) {
							setModel();
							bindObserveChanges(query);

							var orderingQuery = Ordering.find({
								cmpId: cmpId
							});
							ordering = orderingQuery.fetch()[0];
							bindObserveChanges(orderingQuery);
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
		bindObserveChanges(orderingQuery);

		var query = Spaces.find({
			cmpId: cmpId
		});
		Template.treeView.organizationManagerModel.children = convertNode(query.fetch());
		bindObserveChanges(query);
		// set new model to templates
		//Template.treeView.setModel(Template.treeView.organizationManagerModel);
		Template.circleView.setModel(Template.treeView.organizationManagerModel);
	});
};

Template.mainView.updateSpace = function(item) {

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

Template.mainView.insertSpace = function(item) {

	var obj = {
		cmpId: item.cmpId,
		name: item.name,
		parent: item.parent,
		type: item.type,
		id: item.id
	};

	Spaces.insert(obj);
};

Template.mainView.rendered = function() {

};