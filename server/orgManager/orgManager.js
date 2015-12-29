Meteor.methods({
	getSpaces : function(space, terms) {
		this.unblock();
		var apiUrl = Meteor.settings.private.integrationBusPath + '/getSpaces?spaceid='+encodeURIComponent(space)+'&query='+encodeURIComponent(terms);
		var response = Meteor.wrapAsync(apiCall)(apiUrl);
		return response;
	},
	getUsers: function(space, terms){
		this.unblock();
		var apiUrl = Meteor.settings.private.integrationBusPath + '/getUsers?spaceid='+encodeURIComponent(space)+'&query='+encodeURIComponent(terms);
		var response = Meteor.wrapAsync(apiCall)(apiUrl);
		return response;
	}
});

var apiCall = function (apiUrl, callback) {
  // try…catch allows you to handle errors 
  try {
    var response = HTTP.get(apiUrl).data;
    // A successful API call returns no error 
    // but the contents from the JSON responseif 
    callback(null, response);
  } catch (error) {
    // If the API responded with an error message and a payload 
    if (error.response) {
      var errorCode = error.response.data.code;
      var errorMessage = error.response.data.message;
    // Otherwise use a generic error message
    } else {
      var errorCode = 500;
      var errorMessage = 'Cannot access the API';
    }
    // Create an Error object and return it via callback
    var myError = new Meteor.Error(errorCode, errorMessage);
    callback(myError, null);
  }
}