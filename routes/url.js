const express = require("express");
const router = express.Router();
const Url = require("../models/url");
const generateShortUrl = require("../utils/generateShortUrl");
require("dotenv").config();

router.get("/", (req, res) => {
    res.render("url/index", { shortUrl: null });
});

router.post("/shorten", async (req, res) => {
    const { longUrl } = req.body;
    if (!req.body) {
        res.render("url/index", {
            shortUrl: null,
        });
        return;
    }
    let url = await Url.findOne({ longUrl });
    if (url) {
        res.render("url/index", {
            shortUrl: `http://localhost:3000/${url.shortUrl}`,
        });
        return;
    }
    let shortUrl;
    let urlExists = true;
    while (urlExists) {
        shortUrl = await generateShortUrl();
        urlExists = await Url.findOne({ shortUrl });
    }
    url = new Url({
        longUrl,
        shortUrl,
        hitCount: 0,
        dailyHitCount: 0,
        lastAccessedAt: new Date(),
    });
    await url.save();
    res.render("url/index", {
        shortUrl: `http://localhost:8080/redirect/${shortUrl}`,
    });
});

router.get("/redirect/:shortUrl", async (req, res) => {
    const { shortUrl } = req.params;
    const existingUrl = await Url.findOne({ shortUrl });
    if (!existingUrl) {
        res.status(404).send("URL not found");
        return;
    }
    const date = new Date();
    if (date.getDate() !== existingUrl.lastAccessedAt.getDate()) {
        existingUrl.dailyHitCount = 0;
    }
    if (existingUrl.dailyHitCount >= process.env.DAILY_REQUEST_LIMIT) {
        res.status(429).send("Daily limit exceeded");
        return;
    }
    existingUrl.hitCount += 1;
    existingUrl.dailyHitCount += 1;
    existingUrl.lastAccessedAt = date;
    await existingUrl.save();
    if (existingUrl.hitCount % 10 === 0) {
        const randomAdUrl = "https://www.google.com";
        return res.redirect(randomAdUrl);
    }
    res.redirect(existingUrl.longUrl);
});

module.exports = router;
