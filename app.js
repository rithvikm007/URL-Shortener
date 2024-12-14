const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));

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

const port = 8080;

const urlRouter = require("./routes/url");
app.use("/", urlRouter);

app.listen(port, () => {
    console.log("Listening on port " + port);
});
