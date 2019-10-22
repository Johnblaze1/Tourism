const express = require("express");
const router = express.Router();
const joi = require('joi');
const randomString = require('randomstring')
const mailer = require('../misc/mailer');
const nodemailer = require("nodemailer");
const Store = require('../models/user');
const flash = require("connect-flash");
const passport = require("passport");
const User = require("../models/user");

// USER VALIDATION SCHEMA
const storeSchema = joi.object().keys({
    email: joi.string().email().required(),
    name: joi.string().required(),
    password: joi.string().regex(/^[a-zA-Z0-9]{5,30}$/).required(),
    password2: joi.any().valid(joi.ref('password')).required(),
    address: joi.string().required(),
    phoneNumber: joi.string().required(),
    nationality: joi.string().required()


});




router.route("/signup")
    .get((req, res) => {
        res.render("signup.hbs", {
            layout: "signup"
        })
    })
    .post(async (req, res, next) => {
        try {
            const result = joi.validate(req.body, storeSchema);
            console.log(result)

            // Checking the database if email is taken
            const storeEmail = await Store.findOne({ 'email': result.value.email });

            // If email is taken 
            if (storeEmail) {
                req.flash('error', 'Email is already used.');
                res.redirect('back');
                return;
            }

            // Comparison of passwords
            if (req.body.password !== req.body.password2) {
                req.flash('error', 'Passwords mismatch.');
                res.redirect('/user/signup');
                return;
            }

            // Hash the password
            const hash = await Store.hashPassword(result.value.password);
            result.value.password = hash;
            delete result.value.password2;

            // Generation of secret token
            const secretToken = randomString.generate();

            // Save secret token to database
            result.value.secretToken = secretToken;


            // Setting store's acct to be inactive
            result.value.active = false;

            // Saving store to database
            const newStore = await new Store(result.value);
            await newStore.save();
            console.log(`${newStore} created successfully.`);


            // Create email
            const html = `Hello ${result.value.storeName},
      <br/>
      <br>
      Please verify your email by typing the following token:
      <br/>
      Token: <b> ${secretToken}</b>
      <br/>
      On the following page:
      <a href="http://localhost:7000/user/verify">http://localhost:7000/user/verify </a>
      <br><br>
      <strong>All the best!!!</strong>
      `

            // Sending the mail
            await mailer.sendEmail('tourismhospitable@gmail.com', result.value.email, 'Please activate your email', html);
            req.flash('success', ' registration successfully, Please check your email to complete registration.')
            res.redirect('/user/verify')
            // res.redirect('/')
        } catch (error) {
            next(error)
        }
    })


router.route("/verify")
    .get((req, res) => {
        res.render("verify.hbs", {
            layout: 'verify'
        })
    })

    .post(async (req, res, next) => {
        try {
            const { secretToken } = req.body;

            // Find account with matching secret token in the database
            const user = await User.findOne({ secretToken: secretToken.trim() });

            console.log(user)
            // If the secretToken is invalid
            if (!user) {
                req.flash("error", "Your Token is not valid, Please Check your Token");
                res.redirect("/user/verify");
                return;
            }

            // If the secretToken is valid
            user.active = true;
            user.secretToken = "";
            await user.save();

            req.flash("success", "Account verification successfull! You may log in");
            res.redirect("/");
        } catch (error) {
            next(error);
        }
    });



router.route("/login")
    .get((req, res) => {
        res.render("login.hbs", {
            layout: 'login'
        })
    })
    .post(passport.authenticate("local", {
        successRedirect: "/user/dashboard",
        failureRedirect: "/",
        failureFlash: true,
        successFlash: true,
        session: true
    }));

router.route("/dashboard")
    .get(async (req, res) => {
        await User.findById(req.user.id).then(user => {
            res.render("dashboard.hbs", {
                layout: "dashboard", tittle: 'Account',
                fullName: req.user.name, user: user })
                
        })
    })



module.exports = router; 