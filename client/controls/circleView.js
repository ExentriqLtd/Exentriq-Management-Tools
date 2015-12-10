'use strict';

if (window.com === undefined) window.com = {};
if (window.com.exentriq === undefined) window.com.exentriq = {};
if (window.com.exentriq.controls === undefined) window.com.exentriq.controls = {};


com.exentriq.controls.circleView = function(param){

	var onSwitchView = $.noop;
	var root1 = $('<div class="circle-view eq-ui-card"></div>');
	var header = $(
		'<div class="circle-view-header eq-ui-card-title eq-deep-blue-500">'+
			'<h2 class="eq-ui-card-title-text">Holarchy</h2>' +
			'<a data-target="dropdown-add-space" data-hover="false" class="btn btn-primary eq-ui-btn-fab eq-ui-waves-light dropdown-trigger"><i class="mdi mdi-plus icon"></i></a>' +
			'<span class="glyphicon glyphicon-home" aria-hidden="true"></span>' +
		'</div>'
	)
	.appendTo(root1);
	header.find('.glyphicon-home').click(function(){
		onSwitchView();
	});

	var menu = $(
		'<ul id="dropdown-add-space" class="eq-ui-dropdown eq-ui-dropdown-right-top">'+ 
		    '<li name="dropdown-user"><a href="#!">User</a></li>' +
		    '<li name="dropdown-space"><a href="#!">Space</a></li>' +
		'</ul>'
	).appendTo(header);

	menu.find('[name="dropdown-user"]').click(function(){
		debugger;
	});


	function setModel(model){

		root1.children('*').not('.circle-view-header').remove();

		var format = d3.format(",d");
		var margin = 20,
		    diameter = root1.height() > root1.width() ? 
				root1.width() - header.height() : 
				root1.height() - header.height();

		var color = d3.scale.linear()
		    .domain([-1, 5])
		    .range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
		    .interpolate(d3.interpolateHcl);

		var pack = d3.layout.pack()
		    .padding(2)
		    .size([diameter - margin, diameter - margin])
		    .value(function(d) { return d.size; })

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
		    .attr("class", function(d) { return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root"; })
		    .style("fill", function(d) { return d.children ? color(d.depth) : null; })
		    .on("click", function(d) { if (focus !== d) zoom(d), d3.event.stopPropagation(); });

		var text = svg.selectAll("text")
		    .data(nodes)
		    .enter().append("text")
		    .attr("class", "label")
		    .style("fill-opacity", function(d) { return d.parent === model ? 1 : 0; })
		    .style("display", function(d) { return d.parent === model ? "inline" : "none"; })
		    .text(function(d) { return d.name; });

		 var node = svg.selectAll("circle,text");

		d3.select(".circle-view")
		    .style("background", color(-1))
		    .on("click", function() { zoom(model); });

		 zoomTo([model.x, model.y, model.r * 2 + margin]);

		function zoom(d) {
		    var focus0 = focus; focus = d;

		    var transition = d3.transition()
		        .duration(d3.event.altKey ? 7500 : 750)
		        .tween("zoom", function(d) {
		          var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
		          return function(t) { zoomTo(i(t)); };
		        });

		    transition.selectAll("text")
		      .filter(function(d) { return d.parent === focus || this.style.display === "inline"; })
		        .style("fill-opacity", function(d) { return d.parent === focus ? 1 : 0; })
		        .each("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
		        .each("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });
		}

		function zoomTo(v) {
		    var k = diameter / v[2]; view = v;
		    node.attr("transform", function(d) { return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"; });
		    circle.attr("r", function(d) { return d.r * k; });
		}

		d3.select(self.frameElement).style("height", diameter + "px");
	}

	function getModel(){


	}

	return {
		setModel: setModel,
		getModel: getModel,
		onSwitchView: function (fn) { if ($.isFunction(fn)) onSwitchView = fn; },
		getControl: function(){ return root1; }
	}
}