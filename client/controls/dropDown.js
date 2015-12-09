'use strict';

if (window.com === undefined) window.com = {};
if (window.com.exentriq === undefined) window.com.exentriq = {};
if (window.com.exentriq.controls === undefined) window.com.exentriq.controls = {};


com.exentriq.controls.dropDown = function(param){

	var root = $('<ul class="drop-down"></ul>');

	function setItems(items){

		$.Enumerable.From(items).ForEach(function(item){

			$('<li class="drop-down-item"/>')
				.toggleClass('disabled', item.disabled === true)
				.text(item.name)
				.click(item.handler)
				.appendTo(root);
		});
	}

	function show(param){

		root.appendTo('body');
		root.css({
			top: param.top,
			left: param.left
		})
	}

	return {
		show: show,
		setItems: setItems,
		getControl: function(){ return root; }
	}
};