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
		children: $.Enumerable.From(liNode.children('ul').children('li')).Select(function(i) {
			return Template.treeView.getChildModel($(i));
		}).ToArray()
	};
};

Template.treeView.dropDown = function(param) {

	var root = $('<ul class="eq-ui-dropdown"></ul>');
	root.css({
		width: '160px'
	});

	function setItems(items) {

		$.Enumerable.From(items).ForEach(function(item) {

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
	var lis = root.children('li');
	return {
		name: 'root',
		children: $.Enumerable.From(lis).Select(function(i) {
			return Template.treeView.getChildModel($(i));
		}).ToArray()
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

		root.find('li').toArray().forEach(function(liNode) {
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

						if (liNode.hasClass('space')) {
							liNode.addClass('drag-over');
						} else {

						}
					},
					out: function() {
						cleanUp();
					},
					drop: function(e, ui) {

						if (liNode.hasClass('space')) {
							liNode.addClass('expanded');
							ui.draggable.appendTo(childUl);
							cleanUp();

							Template.treeView._onChange();
						}
					}
				})
				.on('click', function() {
					liNode.toggleClass('expanded');
				});
		});
	}

	function setModel() {

		model.children.forEach(function(node) {
			var li = createNode(node);
			li.appendTo(root);
		});

		bindEvents();
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
			'<span class="glyphicon glyphicon-align-justify" aria-hidden="true"></span>' +
			'</span>' +
			'</div>' +
			'<ul class="node-childrens"></ul>' +
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

					liNode.find('.node-childrens:first').append(memoryNode);
					
					// remove cut node from DB
					Spaces.remove({_id: cutNode.data('_id')});
					// Update liNode
					var childrens = Template.treeView.getChildModel(liNode).children;
					childrens.push({
						name: memoryNode.data('name')
					})
					Spaces.update(
						{_id: liNode.data('_id')},
						{
							name: liNode.data('name'),
							children: childrens
						}
					);

					

				} else {

					var oldChildren = Template.treeView.getChildModel(liNode);
					oldChildren.push({
						name: memoryNode.data('name')
					})
					Spaces.update(
						{_id: liNode.data('_id')},
						{
							name: liNode.data('name'),
							children: oldChildren
						}
					);

					liNode.find('.node-childrens:first').append(memoryNode.clone());
				}
				cutNode = null;
				memoryNode = null;

				Template.treeView._onChange();
				bindEvents();
			}
		}, {
			name: 'Delete',
			handler: function() {
				
				Spaces.remove({_id: liNode.data('_id')});
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
			children: $.Enumerable.From(lis).Select(function(i) {
				return Template.treeView.getChildModel($(i));
			}).ToArray()
		};
	}
};

Template.treeView.rendered = function() {
	Template.treeView.setModel(Template.treeView.organizationManagerModel);
};