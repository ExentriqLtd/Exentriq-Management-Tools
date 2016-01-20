var getCall = function (apiUrl, callback) {
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

var postCall = function (apiUrl, apiData) {
	  // try…catch allows you to handle errors 
	 console.log('post...');
	  try {
		  HTTP.call( 'POST', apiUrl, {
			  data: apiData
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


Rest = {
		get: function(url){
			return Meteor.wrapAsync(getCall)(url);
		},
		post: function(url, data){
			return Meteor.wrapAsync(getCall)(url, data);
		}
}