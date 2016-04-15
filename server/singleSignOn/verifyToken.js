/**
 * Created by MehdiMahmoudi on 1/14/16.
 */

Meteor.methods({
    verifyToken: function(token) {
        var result, userData;
        check(token, String);
        result = HTTP.call('POST', Meteor.settings.private.loginEndpoint, {
            data: {
                id: '',
                method: 'auth.loginBySessionToken',
                params: [token]
            }
        });
        userData = result.data.result;
        if (userData !== void 0) {
            var userAccount = Meteor.users.findOne({
                username: userData.username
            }, {
                fields: {
                    _id: 1
                }
            });
            if (userAccount) {
                console.log("Change Password " + userData.username + " " + userAccount._id);
                // Fix problem auto logout: http://stackoverflow.com/questions/27693329/meteor-change-a-user-password-without-logout
                Accounts.setPassword(userAccount._id, "exentriq", {logout: false});
            } else {
                Accounts.createUser({
                    username: userData.username,
                    email: userData.email,
                    password: 'exentriq'
                });
            }
            return userData;
        }
        return null;
    }
});
