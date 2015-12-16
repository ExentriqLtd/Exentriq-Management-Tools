if (Meteor.isServer) {

	Meteor.publish('spaces', function() {
		
		var data = Spaces.find({});
		if (data){
			return data;
		}
		else return this.ready();
	});
}

if (Meteor.isClient) {

	function getChildrensFor(parent) {

		return Spaces.find({
				parent: parent._id
			})
			.fetch()
			.filter(function(i) {
				return i.parent !== null
			})
			.map(function(i) {
				return {
					_id: i._id,
					name: i.name,
					type: 'space',
					children: getChildrensFor(i)
				};
			});
	}

	var _interval;
	function setModel(){

		clearInterval(_interval);
		Template.treeView.setModel(Template.treeView.organizationManagerModel);
		Template.circleView.setModel(Template.treeView.organizationManagerModel);	
	}

	Meteor.subscribe("spaces", {
		onReady: function() {

			var allSpaces = Spaces.find({}).fetch();
			allSpaces.forEach(function(space) {
				if (space.parent === null) {
					Template.treeView.organizationManagerModel.children.push({
						_id: space._id,
						name: space.name,
						type: 'space',
						children: getChildrensFor(space)
					});
				}
			});

			_interval = setInterval(function(){
				Template.treeView.renderDone && 
				Template.circleView.renderDone &&
				setModel();

			},10);
		},
		onError: function() {
			// error spaces subscribe
		}
	});

	var _win = $(window);
	var root = $('.organization-manager');

	

	Template.treeView.organizationManagerModel.children = [];
	Template.treeView.onChange(function() {

		Template.treeView.organizationManagerModel = Template.treeView.getModel();
		Template.treeView.setModel(Template.treeView.organizationManagerModel);
		Template.circleView.setModel(Template.treeView.organizationManagerModel);
	});

	_win.resize(function() {

		if (_win.width() < 600) {
			root.addClass('small');
		} else {
			root.removeClass('small');
			model = Template.treeView.getModel();
			Template.circleView.setModel(model);
		}
	});
}