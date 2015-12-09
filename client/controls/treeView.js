'use strict'

if (window.com === undefined) window.com = {};
if (window.com.exentriq === undefined) window.com.exentriq = {};
if (window.com.exentriq.controls === undefined) window.com.exentriq.controls = {};


com.exentriq.controls.treeView = function(param){

	var onChange = $.noop;
	var onSwitchView = $.noop;

	var memoryNode;
	var cutNode;
	var dd;

	var wrapper = $('<div class="tree-view-wrapper"/>');
	var header = $(
		'<div class="tree-view-header">'+
			'<span class="glyphicon glyphicon-align-justify" aria-hidden="true"></span>' +
			'<h4>Organization Manager</h4>' +
			'<span class="glyphicon glyphicon-globe" aria-hidden="true"></span>' +
		'</div>'
	)
	.appendTo(wrapper);
	header.find('.glyphicon-globe').click(function(){
		onSwitchView();
	});

	var root = $('<ul class="tree-view"></ul>');
	wrapper.append(root);

	$('<button class="btn btn-primary">Add Node</button>')
		.appendTo(wrapper)
		.click(function(){

			var n = createNode({
				name: 'New node..'
			});
			n.appendTo(root);

			onChange();
		});

	wrapper.droppable({
		tolerance: 'pointer',
		over: function(e, ui){
		},
		out: function(){
			cleanUp();
		},
		drop: function(e, ui){
			ui.draggable.appendTo(root);
			cleanUp();
			onChange();
			bindEvents();
		}
	});

	$(window).click(function(){
		dd && dd.getControl().remove();
	});

	function cleanUp(){
		root.find('.drag-over').removeClass('drag-over');
		root.find('.tmp').remove();
	}

	function setModel(model){

		$.Enumerable.From(model).ForEach(function(node){
			var li = createNode(node);
			li.appendTo(root);
		});
		
		bindEvents();
	}

	function showMenuAtction(liNode){
		
		dd && dd.getControl().remove();
		dd = com.exentriq.controls.dropDown();
		dd.setItems([
			{
				name: 'Copy',
				handler: function(node){
					memoryNode = liNode;
					cutNode = null;
				}
			},
			{
				name: 'Cut',
				handler: function(node){
					memoryNode = liNode;
					cutNode = liNode;
				}
			},
			{
				name: 'Paste',
				disabled: !memoryNode,
				handler: function(){
					
					if (cutNode){
						liNode.find('.node-childrens:first').append(memoryNode);	
					}
					else {
						liNode.find('.node-childrens:first').append(memoryNode.clone());
					}
					cutNode = null;
					memoryNode = null;

					onChange();
					bindEvents();
				}
			},
			{
				name: 'Delete',
				handler: function(){
					liNode.remove();

					onChange();
					bindEvents();
				}
			}
		]);
		dd.show({
			top: liNode.offset().top + 20,
			left: liNode.offset().left + liNode.width() - 20
		});
	}
	
	function bindEvents(){
		
		$.Enumerable.From(root.find('li')).ForEach(function(liNode){
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
				start: function () {
				},
				drag: function (ui, position) { 
				},
				stop: function(){ 

				}
			});
			
			liNode.find('.node-action:first').off().on('click', function(e){
				e.stopPropagation();
				showMenuAtction(liNode);
			})

			liNode.find('.tree-node-parent:first')
				.off()
				.droppable({
					tolerance: 'pointer',
					over: function(e, ui){
						liNode.addClass('drag-over');
					},
					out: function(){
						cleanUp();
					},
					drop: function(e, ui){

						liNode.addClass('expanded');
						ui.draggable.appendTo(childUl);
						cleanUp();

						onChange();
					}
			})
			.on('click', function(){
				liNode.toggleClass('expanded');
			});
		});
	}

	function createNode(node){
	
		var liNode = $(
			'<li class="tree-node">'+
				'<div class="tree-node-parent">'+
					'<span class="move-icon">'+
						'<span class="glyphicon glyphicon-option-vertical" aria-hidden="true"></span>' +
						'<span class="glyphicon glyphicon-option-vertical" aria-hidden="true"></span>' +
						'<span class="glyphicon glyphicon-option-vertical" aria-hidden="true"></span>' +
					'</span>' + 
					'<div class="node-title">' + node.name + '</div>' +
					'<span class="node-action">'+
						'<span class="glyphicon glyphicon-align-justify" aria-hidden="true"></span>'+
					'</span>' +
				'</div>' +
				'<ul class="node-childrens"></ul>'+
			'</li>'
		);
		
		function addChildrens(childs){
			childUl.empty();
			$.Enumerable.From(childs).ForEach(function(child){
				var child = createNode(child);
				childUl.append(child);
			});	
		}

		var childUl = liNode.find('.node-childrens'); 
		if (node.children && node.children.length){
			addChildrens(node.children);
		}

		return liNode;
	}

	function getModel(){

		var lis = root.children('li');
		return {
			name: 'root',
			children: $.Enumerable.From(lis).Select(function(i){ return getChildModel($(i)); }).ToArray()
		};
	}

	function getChildModel(liNode){

		return {
			name: liNode.find('.node-title:first').text(),
			size: 50,
			children: $.Enumerable.From(liNode.children('ul').children('li')).Select(function(i){ return getChildModel($(i)); }).ToArray()
		};
	}

	return {
		setModel: setModel,
		getModel: getModel,
		onChange: function (fn) { if ($.isFunction(fn)) onChange = fn; },
		onSwitchView: function (fn) { if ($.isFunction(fn)) onSwitchView = fn; },
		getControl: function(){ return wrapper; }
	}
}