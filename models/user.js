const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    urls: [
        {
            type: Schema.Types.ObjectId,
            ref: "Url",
        },
    ],
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
});

userSchema.plugin(passportLocalMongoose);
const User = mongoose.model("User", userSchema);

module.exports = User;
