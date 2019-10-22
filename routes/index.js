const express = require("express");
// const passport = require("passport");

const router = express.Router();
router.get("/", (request, response) => {
    response.render("index.hbs", {
        layout: "index"
    })

});
router.route("/about")
    .get((req, res) => {
        res.render("about.hbs", {
            layout: "about"
        })
    })
router.route("/gallery")
    .get((req, res) => {
        res.render("gallery.hbs",{
            layout: "gallery"
        })
    })

router.route("/contact")
    .get((req, res) => {
        res.render("contact.hbs", {
            layout: "contact"
        })
    })

router.route("/payment")
    .get((req, res) => {
        res.render("payment.hbs")
    })

// router.route("/admin")
//     .get((req, res) => {
//         res.render("admin/admin.hbs", {
//             layout: "admin"
//         })
//     })




// router.route("/login")
//     .get((req, res) => {
//         res.render("login.hbs")
//     })
//     .post(passport.authenticate("local", {
//         successRedirect: "/dashboard",
//         failureRedirect: "/login",
//         failureFlash: true,
//         successFlash: true,
//         session: true
//     }));

// router.route("/dashboard")
//     .get((req, res) => {
//         res.render("dashboard.hbs")
//     })


// router.get("/about", (request, response) => {
//     response.render("about")

// });





module.exports = router;