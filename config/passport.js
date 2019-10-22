const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/user");
const bcrypt = require('bcryptjs')



// passport.use("local", new LocalStrategy({
//     usernameField: "email",
//     passwordField: "password",
//     passReqToCallback: false
// }, async (req, email, password, done) => {
//      User.findOne({email:email}).then(user=>{
//         if(!user){
//             return done(null, false, { message: "No user with this email" })
//         }

//         bcrypt.compare(password, user.password,(err,passwordMatched)=>{
//             if(err){
//                 return err
//             }
//             if(!passwordMatched){
//                 return done(null, false, { message: "No user with this password" })
//             }

//             return done(null, user, { message: "ok" })
//         })
//     })

// }));

passport.use("local", new LocalStrategy({
    usernameField: "email",
    passwordField: "password",
    passReqToCallback: false
}, async (email, password, done) => {
    try {
        const user = await User.findOne({ "email": email });
        if (!user) {
            return done(null, false, { message: "No user with this email" })
        }

        const isValid = await User.comparePasswords(password, user.password);
        if (!isValid) {
            return done(null, false, { message: "password incorrect, please try again" })
        }

        if (!user.active) {
            return done(null, false, { message: "Sorry, you must confirm your email address" })
        }

        return done(null, user);
    } catch (error) {
        return done(error, false);
    }

}

));



//passport serialize: determines which data of the user object should Userd in the session
passport.serializeUser((user, done) => {
    done(null, user.id);  //in this case, its the user.id
});

//passport deserialize: use the user.id from the serializeUser to get entire user object

passport.deserializeUser(async (id, done) => {

    try {
        const user = await User.findById(id);

        done(null, user);
    }
    catch (error) {
        done(error, null);
    }

});
