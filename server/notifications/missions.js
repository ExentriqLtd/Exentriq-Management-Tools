Meteor.methods({
    'missions.get_all': function(username){
        this.unblock();
        var apiUrl = Meteor.settings.private.integrationBusPath + '/getUserMissions?username=' + encodeURIComponent(username);
        return Rest.get(apiUrl);
    }
});
