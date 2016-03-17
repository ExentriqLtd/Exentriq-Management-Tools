Meteor.methods({
    'tasks.get_all': function(username){
        this.unblock();
        var apiUrl = Meteor.settings.private.integrationBusPath + '/getUserTasks?username=' + encodeURIComponent(username);
        return Rest.get(apiUrl);
    }
});
