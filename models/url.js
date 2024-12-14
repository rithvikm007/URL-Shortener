const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const urlSchema = new Schema(
    {
        longUrl: {
            type: String,
            required: true,
            unique: true,
        },
        shortUrl: {
            type: String,
            required: true,
            unique: true,
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
        lastAccessedAt: {
            type: Date,
            default: () => new Date(),
            required: true,
        },
    },
    { timestamps: true }
);
