var crypto = require('crypto');
var passport = require('passport');
var userUtils = require('../users/api').Api;
var User = require('../models/User').User;
var AuthLocalStrategy = require('passport-local').Strategy;
// var AuthFacebookStrategy = require('passport-facebook').Strategy;
// var AuthVKStrategy = require('passport-vkontakte').Strategy;
 
passport.use('local', new AuthLocalStrategy(
    function (username, password, done) {
        
        console.log("authorization!");
        console.log("username=" + username);
        console.log("password=" + password);

        User.find({name: username}, function(err, user) {
            if (err) {
                done(null, false, {message: 'authorization error!'});
            } else {    
                userUtils.checkPassword(user[0], password, done);
            }
        });
    }
));
 
// passport.use('facebook', new AuthFacebookStrategy({
//         clientID: config.get("auth:fb:app_id"),
//         clientSecret: config.get("auth:fb:secret"),
//         callbackURL: config.get("app:url") + "/auth/fb/callback",
//         profileFields: [
//             'id',
//             'displayName',
//             'profileUrl',
//             "username",
//             "link",
//             "gender",
//             "photos"
//         ]
//     },
//     function (accessToken, refreshToken, profile, done) {
 
//         return done(null, {
//             username: profile.displayName,
//             photoUrl: profile.photos[0].value,
//             profileUrl: profile.profileUrl
//         });
//     }
// ));
 
// passport.use('vk', new AuthVKStrategy({
//         clientID: config.get("auth:vk:app_id"),
//         clientSecret: config.get("auth:vk:secret"),
//         callbackURL: config.get("app:url") + "/auth/vk/callback"
//     },
//     function (accessToken, refreshToken, profile, done) {
 
//         return done(null, {
//             username: profile.displayName,
//             photoUrl: profile.photos[0].value,
//             profileUrl: profile.profileUrl
//         });
//     }
// ));
 
passport.serializeUser(function (user, done) {
    console.log("CHECK USER->");
    console.log(user);

    done(null, JSON.stringify(user));
        
});
 
 
passport.deserializeUser(function (data, done) {
    console.log("deserializeUser");
    try {
        done(null, JSON.parse(data));
    } catch (e) {
        done(err)
    }
});

exports.init = function() {

}