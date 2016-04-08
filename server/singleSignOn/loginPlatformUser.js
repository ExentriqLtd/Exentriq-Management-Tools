/**
 * Created by basgrani on 7/4/16.
 */

Meteor.methods({
    loginPlatformUser: function(username, password) {
        var result, userData;
        check(username, String);
        check(password, String);
        result = HTTP.call('POST', Meteor.settings.private.loginEndpoint, {
            data: {
                id: '',
                method: 'auth.login',
                params: [username, password]
            }
        });
        userData = result.data.result;
        if (userData !== void 0) {
            /*var userAccount = Meteor.users.findOne({
                username: userData.username
            }, {
                fields: {
                    _id: 1
                }
            });
            if (userAccount) {
                console.log("Change Password " + userData.username + " " + userAccount._id);
                Accounts.setPassword(userAccount._id, "exentriq");
            } else {
                Accounts.createUser({
                    username: userData.username,
                    email: userData.email,
                    password: 'exentriq'
                });
            }*/
            return userData;
        }
        return null;
    }
});