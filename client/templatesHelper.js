/* Activities tracker */
Template.registerHelper('formatDate', function(date) {
  return moment(date).format('MMM Do YYYY, hh:mm a');
});

Template.registerHelper('formatLoggedTime', function(logged) {

  var result = '';
  result += logged.days ? (logged.days + 'd') : '';
  result += logged.hours ? (' ' + logged.hours + 'h') : '';
  result += logged.minutes ? (' ' + logged.minutes + 'm') : '';
  return result;
});