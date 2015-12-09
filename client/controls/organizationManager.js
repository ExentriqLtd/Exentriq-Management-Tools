if (window.com === undefined) window.com = {};
if (window.com.exentriq === undefined) window.com.exentriq = {};


com.exentriq.organizationManager = function() {

	var root = $('<div class="organization-manager"></div>');
	var model = {
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

	var _win = $(window);


	function run() {

		var treeView = com.exentriq.controls.treeView();
		treeView.setModel(model.children);
		treeView.getControl().appendTo(root);
		treeView.onChange(function() {

			model = treeView.getModel();
			circleView.setModel(model);
		});
		treeView.onSwitchView(function() {
			root.toggleClass('circle');

			model = treeView.getModel();
			circleView.setModel(model);
		});

		var circleView = com.exentriq.controls.circleView();
		circleView.getControl().appendTo(root);
		circleView.setModel(model);
		circleView.onSwitchView(function() {
			root.toggleClass('circle');
		});

		_win.resize(function() {

			if (_win.width() < 600) {
				root.addClass('small');
			} else {
				root.removeClass('small');
				model = treeView.getModel();
				circleView.setModel(model);
			}
		});

		_win.trigger('resize');

	}

	return {
		run: run,
		getControl: function() {
			return root;
		}
	}
};