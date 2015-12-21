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

Template.treeView.events({
	// Delete item
	'click [name="confirm"]': function() {

		$('#modal-footer').closeModal();
		var item = Template.treeView._menuActionLiNode.data('item');
		Spaces.remove({
			_id: item._id
		});
		Template.treeView._menuActionLiNode.remove();
		Template.treeView._onChange();
		//bindEvents();
		Template.treeView._menuActionLiNode = null;
	}
});


Template.treeView.dropDown = function(param) {

	var root = $('<ol class="eq-ui-dropdown"></ol>');
	root.css({
		width: '160px'
	});

	function setItems(items) {

		items.forEach(function(item) {

			if (item.type == 'divider') {
				$('<li class="divider"></li>').appendTo(root);
			} else {

				$('<li><a name="add-user" href="#eq-ui-modal-add-user" class="eq-ui-modal-trigger">' + item.name + '</a></li>')
					.toggleClass('disabled', item.disabled === true)
					.click(item.handler)
					.find('a')
					.attr('href', item.href || '#')
					.addClass(item.css || '')
					.end()
					.appendTo(root);
			}
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
			sort: function() {},
			change: function() {},
			relocate: function(e, data) {

				console.log('relocate');
				root.find('.allow').removeClass('allow');
				root.find('.deny').removeClass('deny');

				//DB
				var item = data.item.data('item');

				var parent = data.item.parents('li:first').data('item');
				Spaces.update({
					_id: item._id
				}, {
					name: item.name,
					parent: (parent && parent._id) || null,
					type: item.type
				});

				Template.treeView._onChange();
				bindEvents();

				var opened = root.find('.mjs-nestedSortable-expanded');
				opened.addClass('expanded');
				setTimeout(function() {

					root.find('.mjs-nestedSortable-expanded')
						.toArray()
						.forEach(function(i) {
							i = $(i);
							if (!i.hasClass('expanded')) {
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
	}

	function createNode(node) {

		var nodeIcon =
			node.type == 'space' ?
			'<i class="mdi mdi-google-circles-extended eq-ui-icon"></i>' :
			'<i class="mdi mdi-account eq-ui-icon"></i>';
		//eq-ui-list-item
		//<li><a href="#!"><i class="mdi mdi-home icon"></i> Some Action</a></li>
		/*var liNode = $(
			'<li class="tree-node eq-ui-list-item ' + node.type + '">' + 
				'<a href="#!">' + nodeIcon + ' ' + node.name +'</a>' +
				'<ol class="node-childrens eq-ui-list eq-ui-hoverable"></ol>' +	
			'</li>'
		);*/
		var liNode = $(
			'<li class="tree-node ' + node.type + '">' +
			'<div class="tree-node-parent">' +
			'<span class="move-icon">' +
			nodeIcon +
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

		Template.treeView._menuActionLiNode = null;
		var item = liNode.data('item');

		dd && dd.getControl().remove();
		dd = Template.treeView.dropDown();

		var items = [{
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
			css: 'eq-ui-modal-trigger',
			href: '#eq-ui-modal-confirm-delete',
			name: 'Delete',
			handler: function() {

				var item = liNode.data('item');
				var confirmDialog = $('#eq-ui-modal-confirm-delete');
				confirmDialog.find('.item-name').text(item.name);
				Template.treeView._menuActionLiNode = liNode;
			}
		}];

		if (item.type == 'space') {

			items.push({
				type: 'divider'
			});
			items.push({
				name: 'Locate',
				handler: function() {}
			})
		}

		dd.setItems(items);
		dd.show({
			top: liNode.offset().top + 20,
			left: liNode.offset().left + liNode.width() - 20
		});

		// Modal configuration
		$('.eq-ui-modal-trigger').leanModal({
			dismissible: true,
			opacity: .5,
			in_duration: 300,
			out_duration: 200,
			ready: function() {},
			complete: function() {}
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