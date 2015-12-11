if (Meteor.isClient){
	Template.treeView.onChange(function(){

		var m = Template.treeView.getModel();
		Template.circleView.setModel(m);
	});
}