/* Activities tracker */
Template.registerHelper('formatDate', function(date) {

	var format = 'MMM Do YYYY, hh:mm a';
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