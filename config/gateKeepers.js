module.exports = {
    isLoggedIn: (req, res, next) => {
        if (req.isAuthenticated()) {
            return next()
        } else {
            req.flash('error', 'You Have To Login First!');
            res.redirect('/')
        }
    },

    isNotLoggedIn: (req, res, next) => {
        if (!req.isAuthenticated()) {
            return next()
        } else {
            req.flash('error', 'Already Logged In!');
            res.redirect('back')
        }
    }
}