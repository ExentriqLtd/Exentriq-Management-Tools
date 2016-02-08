/* Activities tracker */
Template.registerHelper('formatDate', function(date) {

	var format = 'MMM Do YYYY, hh:mm a';
	return moment(date).format(format);
});

Template.registerHelper('formatDate_MM_DD_YYYY', function(date) {

	var format = 'MM/DD/YYYY';
	return moment(date).format(format);
});

Template.registerHelper('formatLoggedTime', function(logged) {

	var result = '';

	if (logged) {
		result += logged.days ? (logged.days + 'd') : '';
		result += logged.hours ? (' ' + logged.hours + 'h') : '';
		result += logged.minutes ? (' ' + logged.minutes + 'm') : '';
	}
	return result;
});

Template.registerHelper('formatSeconds', function(seconds) {

	var secondsInAMinute = 60;
    var secondsInAnHour  = 60 * secondsInAMinute;
    var secondsInADay    = 8 * secondsInAnHour;

    // extract days
    var days = Math.floor(seconds / secondsInADay);

    // extract hours
    var hourSeconds = seconds % secondsInADay;
    var hours = Math.floor(hourSeconds / secondsInAnHour);

    // extract minutes
    var minuteSeconds = hourSeconds % secondsInAnHour;
    var minutes = Math.floor(minuteSeconds / secondsInAMinute);
    
    var result = '';
    result += days>0 ? (days + 'd') : '';
	result += hours>0 ? (' ' + hours + 'h') : '';
	result += minutes>0 ? (' ' + minutes + 'm') : '';

	return result;
});

Template.registerHelper('formatLink', function(text) {
	if(typeof text == 'string'){
		if(startsWith(text, 'http')){
			return '<a href="'+text+'" target="_blank">'+text+'</a>';
		}
		else{
			return text;
		}
	}
	else{
		return text;
	}
	
});

function startsWith (string, prefix) {
    return string.slice(0, prefix.length) == prefix;
}