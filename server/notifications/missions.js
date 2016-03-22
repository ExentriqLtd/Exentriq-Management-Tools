Meteor.methods({
    'missions.get_all': function(username){
        this.unblock();
        var apiUrl = Meteor.settings.private.integrationBusPath + '/getUserMissions?username=' + encodeURIComponent(username);
        return Rest.get(apiUrl);
    },
    'missions.add': function(data){
        this.unblock();
        var apiUrl = Meteor.settings.private.integrationBusPath + '/createMission';
        return Rest.post(apiUrl, data);
    },
    'missions.open': function(data){
        this.unblock();
        var apiUrl = Meteor.settings.private.integrationBusPath + '/updateMission';
        return Rest.post(apiUrl, data);
    }
});
