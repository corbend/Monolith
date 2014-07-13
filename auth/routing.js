var passport = require('passport');
 
exports.route = function (app) {
 
    app.get('/auth', function (req, res) {
 
        if (req.isAuthenticated()) {
            res.redirect('/');
            return;
        }
        console.log("CHECK AUTH");
 		console.log(req.body);
 		console.log(req.params);

        res.render('login', {'message': req.flash('error')});
    });
 
    app.get('/sign-out', function (req, res) {
        req.logout();
        res.redirect('/');
    });
 
    app.post('/auth', passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/auth',
        failureFlash: true })
    );
 
    app.get('/auth/fb',
        passport.authenticate('facebook', {
            scope: 'read_stream'
        })
    );
 
    app.get('/auth/fb/callback',
        passport.authenticate('facebook', {
            successRedirect: '/',
            failureRedirect: '/auth' })
    );
 
    app.get('/auth/vk',
        passport.authenticate('vk', {
            scope: ['friends']
        }),
        function (req, res) {
         // The request will be redirected to vk.com 
         // for authentication, so
         // this function will not be called.
        });
 
    app.get('/auth/vk/callback',
        passport.authenticate('vk', {
            failureRedirect: '/auth'
        }),
        function (req, res) {
            // Successful authentication
            //, redirect home.
            res.redirect('/');
        });
}