const mongoose = require("mongoose");
require("dotenv").config();
const Url = require("./models/url");

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
    await Url.deleteMany({});
    console.log("Database initialized");
};

initDB();
