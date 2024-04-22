const Profile = require('../models/profile');

module.exports.registerForm = (req, res) => {
    res.render('profiles/register');
};

module.exports.registerSuccessMessage = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const profile = new Profile({ username, email });
        const registeredProfile = await Profile.register(profile, password);
        req.login(registeredProfile, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to CacheMe! Have Fun Caching!');
            res.redirect('/geocaches');
        });
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
};

module.exports.signInForm = (req, res) => {
    res.render('profiles/signin');
};

module.exports.signIn = (req, res) => {
    req.flash('success', 'Welcome Back!');
    const redirectUrl = res.locals.returnToUrl || '/geocaches';
    delete req.session.returnToUrl;
    res.redirect(redirectUrl);
};

module.exports.signOut = function (req, res, next) {
    req.logout(function (err) {
        if (err) { return next(err); }
        req.flash('success', 'You have been successfully logged out');
        res.redirect('/geocaches');
    });
};