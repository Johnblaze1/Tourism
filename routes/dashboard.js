require("../config/passport");
// require("./users");
const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");
const gateKeepers = require('../config/gateKeepers');
// const csrf = require("csurf")
// const csrfProtection = csrf();
// router.use(csrfProtection);

router.route("/")
    .get(gateKeepers.isLoggedIn, (req, res) => {
        User.findById(req.user.id).then(user => {
            res.render("dashboard/index", { layout: 'dashboard', user:user })
        })
    });
//login route
router.route('/login')
    .get((req, res) => {

    })
    .post(
        passport.authenticate("local", {
            successRedirect: "/dashboard",
            failureRedirect: "/",
            failureFlash: true
        })
    )
router.route("/payments")
    .get(gateKeepers.isLoggedIn, (req, res) => {
        res.render("dashboard/payments", {
            layout: 'dashboard',
            tittle: 'Payments',
            fullName: req.user.name

        });
    });
router.route("/updateAccount")
    .get(gateKeepers.isLoggedIn, (req, res) => {
        res.render("dashboard/updateAccount", {
            layout: 'dashboard',
            tittle: 'updateAccount',
            fullName: req.user.name,
            name: req.user.name,
            phoneNumber: req.user.phoneNumber,
            email: req.user.email,
            address: req.user.address,
            nationality: req.user.nationality


        });
    });

//log out
router.route("/logout")
    .get(gateKeepers.isLoggedIn, (req, res) => {
        req.logout();
        req.flash("success", "Successfully Logged Out")
        res.redirect("/");
    });

module.exports = router;
