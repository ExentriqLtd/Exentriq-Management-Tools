'use strict';

Template.treeView.helpers({});
Template.treeView.events({});

Template.treeView.organizationManagerModel = {
	name: "root",
	children: []
};

Template.treeView._onChange = $.noop;
Template.treeView.onChange = function(fn) {
	if ($.isFunction(fn)) Template.treeView._onChange = fn;
};


Template.treeView.dropDown = function(param) {

	var root = $('<ol class="eq-ui-dropdown"></ol>');
	root.css({
		width: '160px'
	});

	function setItems(items) {

		items.forEach(function(item) {
			$('<li><a name="add-user" href="#eq-ui-modal-add-user" class="eq-ui-modal-trigger">' + item.name + '</a></li>')
				.toggleClass('disabled', item.disabled === true)
				.click(item.handler)
				.appendTo(root);
		});
	}

	function show(param) {

		root.appendTo('body');
		root.css({
			top: param.top,
			left: param.left
		});
		root.show();
	}

	return {
		show: show,
		setItems: setItems,
		getControl: function() {
			return root;
		}
	}
};

Template.treeView.getModel = function(param) {

	var root = $('.tree-view');
	var lis = root.children('li').toArray();

	return {
		name: 'root',
		children: lis.map(function(i) {
			return Template.treeView.getChildModel($(i));
		})
	};
};

Template.treeView.getChildModel = function(liNode) {
	return {
		type: liNode.hasClass('space') ? 'space' : 'user',
		name: liNode.find('.node-title:first').text(),
		children: liNode.children('ol').children('li')
			.toArray()
			.map(function(i) { return Template.treeView.getChildModel($(i)); })
	};
};

Template.treeView.setModel = function(model) {

	var dd;
	var memoryNode;
	var cutNode;

	var root = $('.tree-view');
	var wrapper = $('.tree-view-wrapper');

	$(window).click(function() {
		dd && dd.getControl().remove();
	});

	setModel();

	function cleanUp() {
		root.find('.drag-over').removeClass('drag-over');
		root.find('.tmp').remove();
	}

	function bindEvents() {

		// Sortable
		root.nestedSortable({
			handle: '.move-icon',
			items: 'li',
			toleranceElement: '> div',
			relocate: function(e, data) {
				//DB
				Spaces.update({
					_id: data.item.data('_id')
				}, {
					name: data.item.data('name'),
					parent: data.item.parents('li:first').data('_id') || null
				});

				Template.treeView._onChange();
				bindEvents();
			}
		});

		root.find('li').toArray().forEach(function(liNode) {

			liNode = $(liNode);
			liNode.find('.node-action:first').off().on('click', function(e) {
				e.stopPropagation();
				showMenuAtction(liNode);
			});
			liNode.off().on('click', function() {
				liNode.toggleClass('expanded');
			});
		});
	}

	function setModel() {

		root.empty();
		model.children.forEach(function(node) {
			var li = createNode(node);
			li.appendTo(root);
		});

		bindEvents();
		root.sortable();
	}

	function createNode(node) {

		var nodeIcon =
			node.type == 'space' ?
			'glyphicon glyphicon-th-large' :
			'glyphicon glyphicon-user';

		var liNode = $(
			'<li class="tree-node ' + node.type + '">' +
			'<div class="tree-node-parent">' +
			'<span class="move-icon">' +
			'<span class="glyphicon ' + nodeIcon + '" aria-hidden="true"></span>' +
			'</span>' +
			'<div class="node-title">' + node.name + '</div>' +
			'<span class="node-action">' +
			'<span class="glyphicon glyphicon-option-horizontal" aria-hidden="true"></span>' +
			'</span>' +
			'</div>' +
			'<ol class="node-childrens"></ol>' +
			'</li>'
		);

		liNode.data('_id', node._id);
		liNode.data('name', node.name);

		function addChildrens(childs) {
			childUl.empty();
			childs.forEach(function(child) {
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

	function showMenuAtction(liNode) {

		dd && dd.getControl().remove();
		dd = Template.treeView.dropDown();
		dd.setItems([{
			name: 'Copy',
			handler: function(node) {
				memoryNode = liNode;
				cutNode = null;
			}
		}, {
			name: 'Cut',
			handler: function(node) {
				memoryNode = liNode;
				cutNode = liNode;
			}
		}, {
			disabled: !liNode.hasClass('space'),
			name: 'Paste',
			disabled: !memoryNode,
			handler: function() {

				if (cutNode) {

					//UI
					liNode.find('.node-childrens:first').append(memoryNode);

					//DB
					Spaces.update({
						_id: cutNode.data('_id')
					}, {
						name: cutNode.data('name'),
						parent: liNode.data('_id')
					});

				} else {

					//UI
					liNode.find('.node-childrens:first').append(memoryNode.clone());

					//DB
					Spaces.insert({
						name: memoryNode.data('name'),
						parent: liNode.data('_id')
					});
				}
				cutNode = null;
				memoryNode = null;

				Template.treeView._onChange();
				bindEvents();
			}
		}, {
			name: 'Delete',
			handler: function() {

				Spaces.remove({
					_id: liNode.data('_id')
				});
				liNode.remove();
				Template.treeView._onChange();
				bindEvents();
			}
		}]);
		dd.show({
			top: liNode.offset().top + 20,
			left: liNode.offset().left + liNode.width() - 20
		});
	}

	function getModel() {

		var lis = root.children('li');
		return {
			name: 'root',
			children: lis.map(function(i) {
				return Template.treeView.getChildModel($(i));
			})
		};
	}
};

Template.treeView.renderDone = false;
Template.treeView.rendered = function() {
	Template.treeView.renderDone = true;
};