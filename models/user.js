const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const bcrypt = require("bcryptjs");
const Store = require('../models/user');

const { Schema } = mongoose;




const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    nationality: {
        type: String,
        required: true
    },
    password:{
        type:String,
        required: true
    },
    active:Boolean,
    secretToken:String,
})

userSchema.plugin(passportLocalMongoose);
const User = mongoose.model("user", userSchema);

module.exports = User;


module.exports.hashPassword = async password => {
    try {
        const salt = await bcrypt.genSalt(10);
        return await bcrypt.hash(password, salt);
    } catch (error) {
        throw new Error("Hashing failed", error);
    }
};

module.exports.comparePasswords = async (inputpassword, hashPassword) => {
    try {
        return await bcrypt.compare(inputpassword, hashPassword);
    } catch (error) {
        throw new Error("comparing failed", error);
    }
};
