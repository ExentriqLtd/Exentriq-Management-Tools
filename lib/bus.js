Bus = {
		sendNotification: function(notification, busPath){
			var notificationObj = {"name":"Notification", "value":notification};
			var notificationEvent = {"event":"Notification","id":"", "entities":[notificationObj]};
			Rest.post(busPath+"/createEvent", notificationEvent);
		}
}