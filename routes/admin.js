const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user")


router.route("/")
    .get((req, res) => {
        res.render("admin/index.hbs", {
            layout: "admin"
        })
    })




router.route("/statistics")
    .get((req, res) => {
        res.render("admin/statistics", {
            layout: 'admin',
            tittle: 'Statistics',
            totalRegistered: User.length,
        });
    });
router.route("/notify")
    .get((req, res) => {
        res.render("admin/notify", {
            layout: 'admin',
            tittle: 'Notify'
        });
    });
router.route("/settings")
    .get((req, res) => {
        res.render("admin/settings", {
            layout: 'admin',
            tittle: 'Settings'
        });
    });
//log out
router.route("/logout")
    .get((req, res) => {
        req.logout();
        req.flash("success", "successfully logged out")
        res.redirect("/");
    });

module.exports = router;
