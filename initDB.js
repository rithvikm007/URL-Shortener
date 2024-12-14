const mongoose = require("mongoose");
require("dotenv").config();
const Url = require("./models/url");
const User = require("./models/user");
const passportLocalMongoose = require("passport-local-mongoose");

main()
    .then(() => {
        console.log("Connected to Database");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(process.env.MONGODB_URL);
}

const initDB = async () => {
    // Clear existing data
    await Url.deleteMany({});
    await User.deleteMany({});
    console.log("Database initialized");

    const adminUser = new User({
        email: "admin@example.com",
        username: "admin",
        role: "admin",
    });

    await adminUser.setPassword("adminPassword");

    await adminUser.save();
    console.log("Admin user created");
};

initDB();
