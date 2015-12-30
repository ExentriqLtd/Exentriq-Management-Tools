'use strict';

Template.sideMenu.helpers({});
Template.sideMenu.events({});

Template.sideMenu.organizationManagerModel = {
	name: "root",
	children: []
};

Template.sideMenu._onChange = $.noop;
Template.sideMenu.onChange = function(fn) {
	if ($.isFunction(fn)) Template.sideMenu._onChange = fn;
};

Template.sideMenu.events({
});


Template.sideMenu.dropDown = function(param) {

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

Template.sideMenu.getOrdering = function(param) {
	return $('.tree-view').find('li').toArray().map(function(i) {
		return {
			_id: $(i).data('item')._id,
			position: $(i).index()
		}
	});
};

Template.sideMenu.getModel = function(param) {

	var root = $('.tree-view');
	var lis = root.children('li').toArray();

	return {
		name: 'root',
		children: lis.map(function(i) {
			return Template.sideMenu.getChildModel($(i));
		})
	};
};

Template.sideMenu.getChildModel = function(liNode) {

	var item = liNode.data('item');
	return $.extend(item, {
		children: liNode.children('ol').children('li')
			.toArray()
			.map(function(i) {
				return Template.sideMenu.getChildModel($(i));
			})
	});
};

Template.sideMenu.setModel = function(model) {

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

		root.disableSelection();
		root.find('li').toArray().forEach(function(liNode) {

			liNode = $(liNode);

			liNode.find('.node-action:first').off().on('click', function(e) {
				e.stopPropagation();
			});
			liNode.find('.node-title').off().on('click', function() {
				liNode.toggleClass('mjs-nestedSortable-expanded');
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

		var liNode = $(
			'<li class="tree-node ' + node.type + '">' +
			'<div class="tree-node-parent">' +
			'<span class="move-icon">' +
			nodeIcon +
			'</span>' +
			'<div class="node-title">' + node.name + '</div>' +
			'</div>' +
			'<ol class="node-childrens"></ol>' +
			'</li>'
		);

		node.expanded === true && liNode.addClass('mjs-nestedSortable-expanded');
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

	function getModel() {

		var lis = root.children('li');
		return {
			name: 'root',
			children: lis.map(function(i) {
				return Template.sideMenu.getChildModel($(i));
			})
		};
	}
};

Template.sideMenu.renderDone = false;
Template.sideMenu.rendered = function() {
	Template.sideMenu.renderDone = true;
};