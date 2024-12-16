const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const getDateMonthYear = require("../utils/getDateMonthYear");

const urlSchema = new Schema(
    {
        longUrl: {
            type: String,
            required: true,
            unique: true,
            index: true, // Index for faster lookups
        },
        shortUrl: {
            type: String,
            required: true,
            unique: true,
            index: true, // Index for faster lookups
        },
        hitCount: {
            type: Number,
            default: 0,
            required: true,
        },
        dailyHitCount: {
            type: Number,
            default: 0,
            required: true,
        },
        currentDate: {
            type: Object,
            default: () => getDateMonthYear(),
            required: true,
        },
    },
    { timestamps: true }
);

const Url = mongoose.model("Url", urlSchema);

module.exports = Url;
