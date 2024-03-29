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

Template.treeView.removeChildren = function(items) {
	items.forEach(function(i) {
		Spaces.remove({
			_id: i._id
		});
		Template.treeView.removeChildren(i.children || []);
	});
};

Template.treeView.events({
	// Delete item
	'click [name="confirm"]': function() {

		Template.orgManager._block = true;
		var item = Template.treeView._menuActionLiNode;
		Template.treeView.removeChildren(item.children || []);
		Template.orgManager._block = false;

		Spaces.remove({
			_id: item._id
		});

		Template.treeView._menuActionLiNode = null;
	},
	'click .to-circle-view': function() {
		$('.organization-manager').addClass('show-circle');
		$('.organization-manager').removeClass('show-tree');
		Template.treeView.setModel(Template.treeView.organizationManagerModel, {
			allowSorting: true,
			allowMenu: true
		});
		Template.circleView.setModel(Template.treeView.organizationManagerModel);
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

				$('<li><a href="#">' + item.name + '</a></li>')
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

	if (param && param.shadowItem.parent){
		$('.tree-view').find('li').toArray().forEach(function(i){

			if ($(i).data('item')._id === param.shadowItem.parent){
				$('<li/>').hide().data('item', {_id: param.shadowItem._id}).prependTo($(i).find('ol:first'))
			}
		});
	}
	else if (param && param.shadowItem){
		$('<li/>').hide().data('item', {_id: param.shadowItem._id}).prependTo($('.tree-view'));
	}

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
	return $.extend(item, {
		children: liNode.children('ol').children('li')
			.toArray()
			.map(function(i) {
				return Template.treeView.getChildModel($(i));
			})
	});
};

Template.treeView.setModel = function(model, _p) {

	var dd;
	var memoryNode;
	var cutNode;

	var _param = $.extend({
		allowSorting: false,
		allowMenu: false
	}, _p);

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

		if (_param.allowSorting) {
			root.nestedSortable({
				forcePlaceholderSize: true,
				handle: 'div',
				helper: 'clone',
				items: 'li',
				opacity: .6,
				placeholder: 'placeholder',
				revert: 250,
				tabSize: 5,
				tolerance: 'pointer',
				toleranceElement: '> div',
				maxLevels: 10,
				isTree: true,
				expandOnHover: 600,
				startCollapsed: true,
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

					return !placeholderParent.data('item') || placeholderParent.data('item').type == 'space';

				},
				sort: function() {},
				change: function() {},
				relocate: function(e, data) {

					root.find('.allow').removeClass('allow');
					root.find('.deny').removeClass('deny');

					Template.orgManager._block = true;
					Template.treeView._onChange();
					Template.orgManager._block = false;
					//DB
					var item = data.item.data('item');
					var parent = data.item.parents('li:first').data('item');
					Template.orgManager.updateSpace($.extend(item, {
						parent: (parent && parent._id) || null
					}));
				}
			});
			root.disableSelection();
		}

		root.find('li').toArray().forEach(function(liNode) {

			liNode = $(liNode);

			liNode.find('.node-action:first').off().on('click', function(e) {
				e.stopPropagation();
				showMenuAtction(liNode);
			});
			liNode.find('.node-title').off().on('click', function(e) {

				//e.stopPropagation();
				liNode.toggleClass('mjs-nestedSortable-expanded');
				if (liNode.hasClass('space')) {
					root.find('.selected').removeClass('selected');
					liNode.addClass('selected');
					Template.treeView.selectedNode = liNode.data('item');
				} else {
					root.find('.selected').removeClass('selected');
					Template.treeView.selectedNode = null;
				}
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

		var menu = _param.allowMenu ?
			'<span class="node-action">' +
			'<span class="glyphicon glyphicon-option-vertical" aria-hidden="true"></span>' +
			'</span>' :
			'';

		var liNode = $(
			'<li class="tree-node ' + node.type + '">' +
			'<div class="tree-node-parent">' +
			'<span class="move-icon">' +
			nodeIcon +
			'</span>' +
			'<div class="node-title">' + node.name + '</div>' +
			menu +
			'</div>' +
			'<ol class="node-childrens"></ol>' +
			'</li>'
		);

		node.expanded === true && liNode.addClass('mjs-nestedSortable-expanded');
		node.selected === true && liNode.addClass('selected');

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

		var items = [
			/*{
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
						Template.orgManager.updateSpace($.extend(cutItem, {
							parent: item._id
						}));

					} else {

						//UI
						var clone = memoryNode.clone();
						liNode.find('.node-childrens:first').append(memoryNode.clone());

						//DB
						var memoryItem = memoryNode.data('item');
						var _id = Spaces.insert({
							cmpId: memoryItem.cmpId,
							name: memoryItem.name,
							type: memoryItem.type,
							parent: item._id
						});

						clone.data('item', $.extend(memoryItem, {
							_id: _id,
							parent: item._id
						}));
					}
					cutNode = null;
					memoryNode = null;
				}
			}, */
			, {
				css: 'eq-ui-modal-trigger',
				//href: '#eq-ui-modal-confirm-delete',
				name: 'Delete',
				handler: function() {
					var item = liNode.data('item');
					var confirmDialog = $('#eq-ui-modal-confirm-delete');
					confirmDialog.find('.item-name').text(item.name);
					Template.treeView._menuActionLiNode = item;

					$('#eq-ui-modal-confirm-delete').openModal();
				}
			}
		];

		items.push({
			css: 'eq-ui-modal-trigger',
			name: 'Edit',
			handler: function() {

				if (item.type == 'user') {
					Session.set('contextMenuUser', {name: item.name});
					Template.editUserDialog._contextMenuUser = item;
					$('#eq-ui-modal-edit-user').openModal();
					EqUI.forms.validate_form($('#eq-ui-modal-edit-user'));
					setTimeout(function(){
						$('#edit_user_name').focus();
					}, 100);
				} else {
					Session.set('contextMenuSpace', {name: item.name});
					Template.editSpaceDialog._contextMenuSpace = item;
					$('#eq-ui-modal-edit-space').openModal();
					EqUI.forms.validate_form($('#eq-ui-modal-edit-space'));
					setTimeout(function(){
						$('#edit_space_name').focus();
					}, 100);
				}
			}
		});

		items.push({
			type: 'divider'
		});
		items.push({
			name: 'Locate',
			handler: function() {

				$('.organization-manager').addClass('show-circle');
				$('.organization-manager').removeClass('show-tree');

				// set circle model first time
				//if (!Template.circleView.zoomToItem){
				Template.circleView.setModel(Template.treeView.organizationManagerModel);
				//}
				Template.circleView.zoomToItem(item);
			}
		})

		dd.setItems(items);
		dd.show({
			top: liNode.offset().top + 20,
			left: liNode.offset().left + liNode.width() - 20
		});

		// Modal configuration
		//$('#eq-ui-modal-confirm-delete').openModal();
		/*$('.eq-ui-modal-trigger').leanModal({
			dismissible: true,
			opacity: .5,
			in_duration: 300,
			out_duration: 200,
			ready: function() {},
			complete: function() {}
		});*/
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
	$('.tree-view-wrapper').on('keyup', function(e){
		if (e.keyCode == 27){
			$('.tree-view').find('.selected').removeClass('selected');
			Template.treeView.selectedNode = null;	
		}
	});
};

Template.editSpaceDialog.helpers({
	contextMenuSpace: function(){
		return Session.get('contextMenuSpace') || {}
	}
});

Template.editSpaceDialog.events({
	'click #edit_space_submit': function(evt, tpl){
		if (tpl.find('#edit_space_name').value){
			var currentSpace = Template.editSpaceDialog._contextMenuSpace;
			Template.orgManager.updateSpace($.extend(currentSpace, { name: tpl.find('#edit_space_name').value }));
		}
	}
});

Template.editUserDialog.helpers({
	contextMenuUser: function(){
		return Session.get('contextMenuUser') || {}
	}
});

Template.editUserDialog.events({
	'click #edit_user_submit': function(evt, tpl){
		if (tpl.find('#edit_user_name').value){
			var currentUser = Template.editUserDialog._contextMenuUser;
			Template.orgManager.updateSpace($.extend(currentUser, { name: tpl.find('#edit_user_name').value }));
		}
	}
});