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

Template.treeView.getOrdering = function(param) {
	return $('.tree-view').find('li').toArray().map(function(i) {
		return {
			_id: $(i).data('item')._id,
			position: $(i).index()
		}
	});
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
	var item = liNode.data('item'); 
	return {
		type: liNode.hasClass('space') ? 'space' : 'user',
		name: item ? item.name : '',
		_id: item ? item._id : '',
		children: liNode.children('ol').children('li')
			.toArray()
			.map(function(i) {
				return Template.treeView.getChildModel($(i));
			})
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

		root.nestedSortable({
			forcePlaceholderSize: true,
			handle: 'div',
			helper: 'clone',
			items: 'li',
			opacity: .6,
			placeholder: 'placeholder',
			revert: 250,
			tabSize: 25,
			tolerance: 'pointer',
			toleranceElement: '> div',
			maxLevels: 10,
			isTree: true,
			expandOnHover: 1000,
			startCollapsed: false,
			isAllowed: function(placeholder, placeholderParent, currentItem) {

				root.find('.allow').removeClass('allow');
				root.find('.deny').removeClass('deny');

				if (!placeholderParent) {
					return true;
				}

				var placeholderParentItem = placeholderParent.data('item');

				if (placeholderParentItem && placeholderParentItem.type == 'space') {
					placeholderParent.addClass('allow');
				} else if (placeholderParentItem) {
					placeholderParent.addClass('deny');
				}

				console.log(!placeholderParent.data('item') || placeholderParent.data('item').type == 'space');
				return !placeholderParent.data('item') || placeholderParent.data('item').type == 'space';

			},
			sort: function() {
			},
			change: function() {
			},
			relocate: function(e, data) {

				console.log('relocate');
				root.find('.allow').removeClass('allow');
				root.find('.deny').removeClass('deny');

				//DB
				var item = data.item.data('item');

				var parent = data.item.parents('li:first').data('item');
				Spaces.update({_id: item._id}, {
					name: item.name,
					parent: (parent && parent._id) || null,
					type: item.type
				});

				Template.treeView._onChange();
				bindEvents();

				var opened = root.find('.mjs-nestedSortable-expanded');
				opened.addClass('expanded');
				setTimeout(function(){

					root.find('.mjs-nestedSortable-expanded')
						.toArray()
						.forEach(function(i){
							i = $(i);
							if (!i.hasClass('expanded')){
								i.removeClass('mjs-nestedSortable-expanded');
							}
							i.removeClass('expanded');
						});
				}, 1);
			}
		});
		root.disableSelection();
		root.find('li').toArray().forEach(function(liNode) {

			liNode = $(liNode);

			liNode.find('.node-action:first').off().on('click', function(e) {
				e.stopPropagation();
				showMenuAtction(liNode);
			});
			liNode.find('.node-title').off().on('click', function() {
				liNode.toggleClass('mjs-nestedSortable-expanded');
				//liNode.toggleClass('expanded');
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

		liNode.data('item', node);

		if (node.name == 'SP-008'){
			//root.append('<li class="placeholder" style="40px;"></li>');
		}

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
					var cutItem = cutNode.data('item');
					Spaces.update({
						_id: cutItem._id
					}, {
						name: cutItem.name,
						parent: liNode.data('item')._id,
						type: cutItem.type
					});

				} else {

					//UI
					var clone = memoryNode.clone();
					liNode.find('.node-childrens:first').append(memoryNode.clone());

					//DB
					var memoryItem = memoryNode.data('item');
					var _id = Spaces.insert({
						name: memoryItem.name,
						type: memoryItem.type,
						parent: liNode.data('item')._id
					});

					clone.data('item', $.extend(memoryItem, {
						_id: _id,
						parent: liNode.data('item')._id
					}));
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
					_id: liNode.data('item')._id
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