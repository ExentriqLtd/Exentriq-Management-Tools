'use strict';

Template.circleView.helpers({
	'feature': function() {
		return [{
			'text': 'Uses trusted packages',
			'icon': 'archive',
			'path': '#packages'
		}, {
			'text': 'Has a console tool',
			'icon': 'terminal',
			'path': '#console-tool'
		}, {
			'text': 'Embraces HTML5',
			'icon': 'html5',
			'color': 'hover-orange',
			'path': '#html5'
		}, {
			'text': 'Provides a structure',
			'icon': 'folder',
			'path': '#structure'
		}];
	}
});

Template.circleView.events({
	'click .to-tree-view': function(){
		$('.organization-manager').addClass('show-tree');
		$('.organization-manager').removeClass('show-circle');
	}
});

Template.circleView._setSize = function(childrens) {

	childrens.forEach(function(i) {
		i.size = 50;
		Template.circleView._setSize(i.children || []);
	});
};

Template.circleView.setModel = function(_model) {

	var root1 = $('.circle-view');
	root1.children('*').not('.dropdown-trigger').remove();

	if (!root1.is(':visible') || !_model || !_model.children || !_model.children.length) {
		return;
	}

	var model = jQuery.extend(true, {}, _model)
	// set size
	Template.circleView._setSize(model.children);

	var format = d3.format(",d");
	var margin = 20,
		diameter = root1.height() > root1.width() ?
		root1.width() :
		root1.height();

	var color = d3.scale.linear()
		.domain([-1, 5])
		.range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
		.interpolate(d3.interpolateHcl);

	var pack = d3.layout.pack()
		.padding(2)
		.size([diameter - margin, diameter - margin])
		.value(function(d) {
			return d.size;
		});

	var svg = d3.select(".circle-view").append("svg")
		.attr("width", diameter)
		.attr("height", diameter)
		.append("g")
		.attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

	var focus = model,
		nodes = pack.nodes(model),
		view;

	var circle = svg.selectAll("circle")
		.data(nodes)
		.enter().append("circle")
		.attr("class", function(d) {
			return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root";
		})
		.style("fill", function(d) {
			return d.children ? color(d.depth) : null;
		})
		.on("click", function(d) {
			if (focus !== d) zoom(d), d3.event.stopPropagation();
		});

	var text = svg.selectAll("text")
		.data(nodes)
		.enter().append("text")
		.attr("class", "label")
		.style("fill-opacity", function(d) {
			return d.parent === model ? 1 : 0;
		})
		.style("display", function(d) {
			return d.parent === model ? "inline" : "none";
		})
		.text(function(d) {
			return d.name;
		});

	var node = svg.selectAll("circle,text");

	d3.select(".circle-view")
		.style("background", color(-1))
		.on("click", function() {
			zoom(model);
		});

	zoomTo([model.x, model.y, model.r * 2 + margin]);

	function zoom(_d) {

		var d;

		function findCircle(items){

			items.forEach && items.forEach(function(i){
				if (i._id === _d._id){
					d = i;
					return false;
				}

				findCircle(i.children || []);
			});			
		}

		findCircle(model.children || []);

		if (!d){
			d = model;
		}

		var focus0 = focus;
		focus = d;
		var transition = d3.transition()
			.duration((d3.event && d3.event.altKey) ? 7500 : 750)
			.tween("zoom", function(d) {
				var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
				return function(t) {
					zoomTo(i(t));
				};
			});

		transition.selectAll("text")
			.filter(function(d) {
				return d.parent === focus || this.style.display === "inline";
			})
			.style("fill-opacity", function(d) {
				return d.parent === focus ? 1 : 0;
			})
			.each("start", function(d) {
				if (d.parent === focus) this.style.display = "inline";
			})
			.each("end", function(d) {
				if (d.parent !== focus) this.style.display = "none";
			});

		$('svg').css({
			width: $('.circle-view').width(),
			height: 2000
		});
		pack.size([$('.circle-view').width(), 2000]);
	}

	function zoomTo(v) {
		var k = diameter / v[2];
		view = v;
		node.attr("transform", function(d) {
			return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")";
		});
		circle.attr("r", function(d) {
			return d.r * k;
		});
	}

	Template.circleView.zoomToItem = zoom;

	//d3.select(self.frameElement).style("height", diameter + "px");
};

Template.circleView.renderDone = false;
Template.circleView.rendered = function() {

	// DropDown configuration
	$('.dropdown-trigger').dropdown({
        inDuration: 300,
        outDuration: 225,
        hover: true,
        gutter: 0,
        belowOrigin: false
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

	Template.circleView.renderDone = true;
};