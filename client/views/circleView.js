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
	// Create new Space
	'click #create_space_submit': function(){

		$('#create-space').closeModal();
		var newSpaceForm = $('#eq-ui-modal-create-space-form');
		var spaceName = newSpaceForm.find('#create_space_name').val();

		Spaces.insert({ name: spaceName, parent: null });

		Template.treeView.organizationManagerModel.children.push({
			type: 'space',
			name: spaceName,
			children: []
		});

		Template.circleView.setModel(Template.treeView.organizationManagerModel);
	}
});

Template.circleView._setSize = function(childrens) {

	childrens.forEach(function(i){
		i.size = 50;
		Template.circleView._setSize(i.children || []);
	});
};

Template.circleView.setModel = function(model) {

	var root1 = $('.circle-view');
	var header = $('.circle-view-header');
	root1.children('*').not('.circle-view-header').remove();

	if (!model || !model.children || !model.children.length){
		return;
	}

	// set size
	Template.circleView._setSize(model.children);
	console.log(model.children);

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
		.value(function(d) {
			return d.size;
		})

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

	function zoom(d) {
		var focus0 = focus;
		focus = d;

		var transition = d3.transition()
			.duration(d3.event.altKey ? 7500 : 750)
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

	d3.select(self.frameElement).style("height", diameter + "px");
};

Template.circleView.rendered = function() {

	// Modal configuration
	$('.eq-ui-modal-trigger').leanModal({
		dismissible: true, // Modal can be dismissed by clicking outside of the modal
		opacity: .5, // Opacity of modal background
		in_duration: 300, // Transition in duration
		out_duration: 200, // Transition out duration
		ready: function() {
			console.log('Modal Open');
		}, // Callback for Modal open
		complete: function() {
				console.log('Modal Close');
			} // Callback for Modal close
	});

	Template.circleView.setModel(Template.treeView.organizationManagerModel);
};