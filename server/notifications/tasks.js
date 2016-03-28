Meteor.methods({
    'tasks.get_all': function(username){
        this.unblock();
        var apiUrl = Meteor.settings.private.integrationBusPath + '/getUserTasks?username=' + encodeURIComponent(username);
        return Rest.get(apiUrl);
    },
    'tasks.add': function(data){
        this.unblock();
        var apiUrl = Meteor.settings.private.integrationBusPath + '/createTask';
        return Rest.post(apiUrl, data);
    },
    'tasks.open': function(data){
        this.unblock();
        var apiUrl = Meteor.settings.private.integrationBusPath + '/updateTask';
        return Rest.post(apiUrl, data);
    }
});
