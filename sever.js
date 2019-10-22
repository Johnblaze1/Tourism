require("dotenv").config("./.env");

const express = require("express");
const app = express();
const logger = require("morgan");
const path = require("path");
// const request = require("request");
const request = require("request");
const expresshandlebars = require("express-handlebars");
const bodyParser = require("body-parser");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const passport = require("passport");
require("./config/passport");
const User = require("./models/user");
const { Pay } = require('./models/pay')
const { initializePayment, verifyPayment } = require('./config/paystack')(request);
const _ = require('lodash');

const mongoose = require("mongoose");

const mongoStore = require("connect-mongo")(session)
// DataBase connections
mongoose.promise = global.promise;
const MONGO_URL = require("./config/db").MONGOURL;
mongoose
    .connect(MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log(`Database connected at ${MONGO_URL}`))
    .catch(err => console.log(`Database Connection failed ${err.message}`));





app.use(logger("dev"));

// templating engine Setup
app.engine(".hbs", expresshandlebars({
    defaultLayout: "index",
    extname: ".hbs"
}));

app.set("view engine", ".hbs");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))


//more middlewares
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));
app.use(session({
    secret: 'ExploreNigeria',
    resave: false,
    saveUninitialized: false,
    store: new mongoStore({ mongooseConnection: mongoose.connection }),
    cookie: ({
        maxAge: 80 * 60 * 1000
    })
}))

// initalize passport
app.use(passport.initialize());
app.use(passport.session());

app.use(flash())

app.use((req, res, next) => {
    res.locals.success_messages = req.flash("success");
    res.locals.error_messages = req.flash("error");
    res.locals.user = req.user ? true : false;
    res.locals.session = req.session;
    next();

})



// exported modules
app.use("/", require("./routes/index"));
// user route
app.use("/user", require("./routes/user"));


//admin route
app.use("/admin", require("./routes/admin"));

// dashboard route

app.use("/dashboard", require("./routes/dashboard"));


// payapp route
app.use("/users", require("./routes/payapp"));


//paystack
app.get('/pay', (req, res) => {
    res.render("payer/pay")
});


app.post("/paystack/pay", (req, res) => {
    const form = _.pick(req.body, ["amount", "email", "fullName"]);
    form.metadata = {
        fullName: form.fullName
    };
    form.amount *= 100;

    initializePayment(form, (error, body) => {
        if (error) {
            //handle errors
            console.log(error);
            return res.redirect("/error");
            return;
        }
        response = JSON.parse(body);
        res.redirect(response.data.authorization_url);
    });
});

app.get("/paystack/callback", (req, res) => {
    const ref = req.query.reference;
    verifyPayment(ref, (error, body) => {
        if (error) {
            //handle errors appropriately
            console.log(error);
            return res.redirect("/error");
        }
        response = JSON.parse(body);

        const data = _.at(response.data, ["reference", "amount", "customer.email", "metadata.fullName"]);

        [reference, amount, email, fullName] = data;

        newPay = { reference, amount, email, fullName };

        const pay = new Pay(newPay);

        pay.save()
            .then(pay => {
                if (!pay) {
                    return res.redirect("/error");
                }
                res.redirect("/receipt/" + pay._id);
            })
            .catch(e => {
                res.redirect("/error");
            });
        console.log(pay);
    });
});

app.get("/receipt/:id", (req, res) => {
    const id = req.params.id;
    Pay.findById(id)
        .then(pay => {
            if (!pay) {
                //handle error when the Pay is not found
                res.redirect("/error");
            }
            let payAmount = pay.amount / 100;
            res.render("success", { pay, payAmount });
        })
        .catch(e => {
            res.redirect("/error");
            console.log(e);
        });
});

app.get((req, res) => {
    res.render('error404.hbs')
})



app.post("/newsletter", function (req, res) {
    addEmailToMailchip(req.body.email);
    req.flash('success', 'Thank you for subscribing to our newsletter')
    res.redirect("/")
});

const port = process.env.PORT;

app.listen(port, (req, res) => {
    console.log(`the sever has started at port ${port}..`)
});



function addEmailToMailchip(email) {
    var request = require("request");

    var options = {
        method: 'POST',
        url: 'https://us4.api.mailchimp.com/3.0/lists/2415b8145c/members',
        headers:
        {
            'Postman-Token': '09fc6d0b-d4a8-4be9-a81a-dd03401efb88',
            'cache-control': 'no-cache',
            Authorization: 'Basic YW55c3RyaW5nOmFjYWY5Yzc3MDU2MDcyNGNhMGYxMjM2N2NhNTBkNjFlLXVzNA==',
            'Content-Type': 'application/json'
        },
        body:
        {
            email_address: email,
            status: 'subscribed'
        },
        json: true
    };

    request(options, function (error, response, body) {
        if (error) {
            console.log(error)
        }

        console.log(body);
    });


}