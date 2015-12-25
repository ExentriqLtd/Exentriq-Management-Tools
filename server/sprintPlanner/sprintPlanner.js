
Meteor.methods({
	
	'getTasks' : function(username, space, team) {
		console.log(team);
		// avoid blocking other method calls from the same client
		this.unblock();
		var apiUrl = 'http://bus.stage.exentriq.com:1880/getEmlTasks?space='+encodeURIComponent(space)+'&team='+encodeURIComponent(team);
		// asynchronous call to the dedicated API calling function
		var response = Meteor.wrapAsync(apiCall)(apiUrl);
		return response;
	},
	'addEmlStatement' : function(username, space, team, statementId, statementEml){
		this.unblock();
		var apiUrl = 'http://bus.stage.exentriq.com:1880/addEmlStatement';
		var response = Meteor.wrapAsync(apiCallPost)(apiUrl, username, space, team, statementId, statementEml);
		return response;
	},
	'getTeams' : function(space){
		// avoid blocking other method calls from the same client
		this.unblock();
		var apiUrl = 'http://bus.stage.exentriq.com:1880/getTeams?space='+space;
		// asynchronous call to the dedicated API calling function
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

var apiCallPost = function (apiUrl, username, space, team, statementId, statementEml, callback) {
	  // try…catch allows you to handle errors 
	 console.log('post...');
	  try {
		  HTTP.call( 'POST', apiUrl, {
			  data: {"id":statementId, "author":username, "space":space, "team":team, "message":statementEml}
			}, function( error, response ) {
			  if ( error ) {
			    callback(error, null);
			  } else {
			    callback(null, response.data);
			  }
			});
		  console.log('post done');
	  } catch (error) {
		  console.log(error);
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