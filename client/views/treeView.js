Template.treeView.helpers({});
Template.treeView.events({});

Template.treeView.organizationManagerModel = {
	"name": "root",
	"children": [{
		"name": "analytics",
		"children": [{
			"name": "cluster",
			"children": [{
				"name": "AgglomerativeCluster",
				"size": 50
			}, {
				"name": "CommunityStructure",
				"size": 50
			}, {
				"name": "HierarchicalCluster",
				"size": 50
			}, {
				"name": "MergeEdge",
				"size": 50
			}]
		}, {
			"name": "graph",
			"children": [{
				"name": "BetweennessCentrality",
				"size": 50
			}, {
				"name": "LinkDistance",
				"size": 50
			}, {
				"name": "MaxFlowMinCut",
				"size": 50
			}, {
				"name": "ShortestPaths",
				"size": 50
			}, {
				"name": "SpanningTree",
				"size": 50
			}]
		}]
	}, {
		"name": "animate"
	}, {
		"name": "data",
		"children": [{
			"name": "DataUtil",
			"size": 50
		}]
	}, {
		"name": "display",
		"children": [{
			"name": "DirtySprite",
			"size": 50
		}, {
			"name": "LineSprite",
			"size": 50
		}, {
			"name": "RectSprite",
			"size": 50
		}, {
			"name": "TextSprite",
			"size": 50
		}]
	}, {
		"name": "vis",
		"children": [{
			"name": "Visualization",
			"size": 50
		}]
	}]
};

Template.treeView._onChange = $.noop;
Template.treeView.onChange = function(fn) {
	if ($.isFunction(fn)) Template.treeView._onChange = fn;
};

Template.treeView.getModel = function() {

	var root = $('.tree-view');
	var lis = root.children('li');
	var model = {
		name: 'root',
		children: $.Enumerable.From(lis).Select(function(i) {
			return Template.treeView.getChildModel($(i));
		}).ToArray()
	};
	return model;
};

Template.treeView.getChildModel = function(liNode) {

	return {
		name: liNode.find('.node-title:first').text(),
		size: 50,
		children: $.Enumerable.From(liNode.children('ul').children('li')).Select(function(i) {
			return Template.treeView.getChildModel($(i));
		}).ToArray()
	};
}

Template.treeView.rendered = function() {

	var model = Template.treeView.organizationManagerModel;
	var root = $('.tree-view');
	var wrapper = $('.tree-view-wrapper');

	wrapper.droppable({
		tolerance: 'pointer',
		over: function(e, ui) {},
		out: function() {
			cleanUp();
		},
		drop: function(e, ui) {
			ui.draggable.appendTo(root);
			cleanUp();
			Template.treeView._onChange();
			bindEvents();
		}
	});

	setModel();

	function cleanUp() {
		root.find('.drag-over').removeClass('drag-over');
		root.find('.tmp').remove();
	}

	function bindEvents() {

		$.Enumerable.From(root.find('li')).ForEach(function(liNode) {
			liNode = $(liNode);

			var childUl = liNode.find('.node-childrens:first');
			liNode.draggable({
				containment: $('.organization-manager'),
				//appendTo: 'body',
				scroll: false,
				handle: liNode.find('.move-icon'),
				revert: true,
				refreshPositions: true,
				zIndex: 1,
				cancel: null,
				start: function() {},
				drag: function(ui, position) {},
				stop: function() {

				}
			});

			liNode.find('.node-action:first').off().on('click', function(e) {
				e.stopPropagation();
				showMenuAtction(liNode);
			})

			liNode.find('.tree-node-parent:first')
				.off()
				.droppable({
					tolerance: 'pointer',
					over: function(e, ui) {
						liNode.addClass('drag-over');
					},
					out: function() {
						cleanUp();
					},
					drop: function(e, ui) {

						liNode.addClass('expanded');
						ui.draggable.appendTo(childUl);
						cleanUp();

						Template.treeView._onChange
					}
				})
				.on('click', function() {
					liNode.toggleClass('expanded');
				});
		});
	}

	function setModel() {

		$.Enumerable.From(model.children).ForEach(function(node) {
			var li = createNode(node);
			li.appendTo(root);
		});

		bindEvents();
	}

	function createNode(node) {

		var liNode = $(
			'<li class="tree-node">' +
			'<div class="tree-node-parent">' +
			'<span class="move-icon">' +
			'<span class="glyphicon glyphicon-option-vertical" aria-hidden="true"></span>' +
			'<span class="glyphicon glyphicon-option-vertical" aria-hidden="true"></span>' +
			'<span class="glyphicon glyphicon-option-vertical" aria-hidden="true"></span>' +
			'</span>' +
			'<div class="node-title">' + node.name + '</div>' +
			'<span class="node-action">' +
			'<span class="glyphicon glyphicon-align-justify" aria-hidden="true"></span>' +
			'</span>' +
			'</div>' +
			'<ul class="node-childrens"></ul>' +
			'</li>'
		);

		function addChildrens(childs) {
			childUl.empty();
			$.Enumerable.From(childs).ForEach(function(child) {
				var child = createNode(child);
				childUl.append(child);
			});
		}

		var childUl = liNode.find('.node-childrens');
		if (node.children && node.children.length) {
			addChildrens(node.children);
		}

		return liNode;
	}

	function getModel() {

		var lis = root.children('li');
		return {
			name: 'root',
			children: $.Enumerable.From(lis).Select(function(i) {
				return Template.treeView.getChildModel($(i));
			}).ToArray()
		};
	}
};