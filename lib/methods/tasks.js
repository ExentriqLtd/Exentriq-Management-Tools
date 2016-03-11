// Tasks
Meteor.methods({
    "tasks.set_all_complete": function (id) {
        // TODO - Connect to DB
        // Simulate DB
        var _old_data = EqApp.tasks_data.get();
        for (var key in _old_data) {
            _old_data[key].complete = true;
        }
        EqApp.tasks_data.set(_old_data);
    },
    "tasks.set_complete": function (id, value) {
        // TODO - Connect to DB
        // Simulate DB
        var _old_data = EqApp.tasks_data.get();
        for (var key in _old_data) {
            if (_old_data[key].id === id) {
                _old_data[key].complete = value;
            }
        }
        EqApp.tasks_data.set(_old_data);
    }
});


//---------------------------------------------------
//  Sample data
//---------------------------------------------------
EqApp.tasks_data = new ReactiveVar([]);
EqApp.tasks_data.set(
[{
    "id": 1,
    "avatar": "http://dummyimage.com/100x100.jpg/cc0000/ffffff",
    "first_name": "Philip",
    "description": "libero convallis eget eleifend luctus ultricies",
    "action": "https://shareasale.com/congue/eget/semper.jsp",
    "date": "2015-10-25T03:16:04Z",
    "complete": false

}, {
    "id": 2,
    "avatar": "http://dummyimage.com/100x100.jpg/ff4444/ffffff",
    "first_name": "Peter",
    "description": "ipsum aliquam non mauris morbi non",
    "action": "https://stanford.edu/sit/amet/sem/fusce.png",
    "date": "2015-10-04T09:49:11Z",
    "complete": false
}, {
    "id": 3,
    "avatar": "http://dummyimage.com/100x100.jpg/5fa2dd/ffffff",
    "first_name": "Albert",
    "description": "est lacinia nisi venenatis tristique fusce",
    "action": "http://desdev.cn/nec/sem/duis/aliquam/convallis/nunc.jsp",
    "date": "2016-02-01T09:25:46Z",
    "complete": true
}, {
    "id": 4,
    "avatar": "http://dummyimage.com/100x100.jpg/dddddd/000000",
    "first_name": "Barbara",
    "description": "vel augue vestibulum ante ipsum primis",
    "action": "https://pinterest.com/felis/sed/lacus/morbi/sem/mauris/laoreet.html",
    "date": "2016-03-06T20:13:10Z",
    "complete": false
}, {
    "id": 5,
    "avatar": "http://dummyimage.com/100x100.jpg/cc0000/ffffff",
    "first_name": "Justin",
    "description": "in porttitor pede justo eu massa",
    "action": "https://npr.org/maecenas.json",
    "date": "2015-10-17T06:40:39Z",
    "complete": true
}, {
    "id": 6,
    "avatar": "http://dummyimage.com/100x100.jpg/ff4444/ffffff",
    "first_name": "Pamela",
    "description": "cubilia curae nulla dapibus dolor vel",
    "action": "http://drupal.org/nulla/neque/libero/convallis/eget.png",
    "date": "2015-09-11T00:30:41Z",
    "complete": false
}, {
    "id": 7,
    "avatar": "http://dummyimage.com/100x100.jpg/cc0000/ffffff",
    "first_name": "Brenda",
    "description": "fermentum condimentum neque sapien",
    "action": "https://delicious.com/nulla/facilisi/cras/non.xml",
    "date": "2015-08-19T06:35:59Z",
    "complete": true
}, {
    "id": 8,
    "avatar": "http://dummyimage.com/100x100.jpg/5fa2dd/ffffff",
    "first_name": "Brian",
    "description": "dictumst maecenas ut massa quis augue",
    "action": "https://livejournal.com/in/leo/maecenas/pulvinar/lobortis/est/phasellus.aspx",
    "date": "2015-12-02T10:40:35Z",
    "complete": true
}, {
    "id": 9,
    "avatar": "http://dummyimage.com/100x100.jpg/cc0000/ffffff",
    "first_name": "Kathy",
    "description": "rhoncus dui vel sem sed sagittis",
    "action": "https://telegraph.co.uk/dui/maecenas/tristique/est/et/tempus/semper.xml",
    "date": "2016-02-14T00:31:47Z",
    "complete": true
}, {
    "id": 10,
    "avatar": "http://dummyimage.com/100x100.jpg/cc0000/ffffff",
    "first_name": "Willie",
    "description": "posuere cubilia curae mauris viverra diam",
    "action": "http://aol.com/tempus/vivamus/in/felis/eu/sapien.jsp",
    "date": "2015-09-03T04:51:41Z",
    "complete": true
}, {
    "id": 11,
    "avatar": "http://dummyimage.com/100x100.jpg/cc0000/ffffff",
    "first_name": "Jimmy",
    "description": "sagittis nam congue risus semper porta",
    "action": "http://discovery.com/orci/vehicula/condimentum/curabitur/in.js",
    "date": "2015-09-19T00:38:46Z",
    "complete": true
}, {
    "id": 12,
    "avatar": "http://dummyimage.com/100x100.jpg/ff4444/ffffff",
    "first_name": "Donald",
    "description": "consequat varius integer ac leo pellentesque",
    "action": "http://joomla.org/est/congue/elementum/in/hac/habitasse/platea.json",
    "date": "2015-08-16T03:16:03Z",
    "complete": true
}]
);
