const express = require("express");
const router = express.Router();
const Url = require("../models/url");
const generateShortUrl = require("../utils/generateShortUrl");
const wrapAsync = require("../utils/wrapAsync");
require("dotenv").config();
const DAILY_REQUEST_LIMIT = parseInt(
    process.env.DAILY_REQUEST_LIMIT || 100,
    10
);
const BACKEND_URL = process.env.BACKEND_URL;
router.get("/shorten", (req, res) => {
    res.render("url/shorten", { shortUrl: null });
});

router.get(
    "/show",
    wrapAsync(async (req, res) => {
        const allUrls = await Url.find();
        res.render("url/show", { urls: allUrls });
    })
);

const isValidUrl = (url) => {
    try {
        const parsedUrl = new URL(url);
        return ["http:", "https:"].includes(parsedUrl.protocol);
    } catch (err) {
        return false;
    }
};

router.post(
    "/shorten",
    wrapAsync(async (req, res) => {
        const { longUrl } = req.body;
        if (!req.body) {
            res.status(500).json({ message: "Internal Server Error" });
            return;
        }
        if (!isValidUrl(longUrl)) {
            req.flash("error", "Invalid URL format.");
            return res.redirect("/shorten");
        }
        let url = await Url.findOne({ longUrl });
        if (url) {
            return res
                .status(201)
                .json({ shortUrl: `${BACKEND_URL}/${url.shortUrl}` });
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
        return res
            .status(201)
            .json({ shortUrl: `${BACKEND_URL}/${url.shortUrl}` });
    })
);

router.get(
    "/redirect/:shortUrl",
    wrapAsync(async (req, res) => {
        let { shortUrl } = req.params;
        const existingUrl = await Url.findOne({ shortUrl });
        if (!existingUrl) {
            res.status(404).json({ error: "URL not found", code: 404 });

            return;
        }
        const date = new Date();
        const lastReset = existingUrl.lastReset || existingUrl.lastAccessedAt;
        if (Date.now() - new Date(lastReset).getTime() >= 24 * 60 * 60 * 1000) {
            existingUrl.dailyHitCount = 0;
            existingUrl.lastReset = Date.now();
        }
        if (existingUrl.dailyHitCount >= DAILY_REQUEST_LIMIT) {
            res.status(400).json({ message: "Limit exceeded" });
            return;
        }
        existingUrl.hitCount += 1;
        existingUrl.dailyHitCount += 1;
        existingUrl.lastAccessedAt = date;
        await existingUrl.save();
        if (existingUrl.hitCount % 10 === 0) {
            const randomAdUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
            return res.redirect(randomAdUrl);
        }
        res.redirect(existingUrl.longUrl);
    })
);

// Route to display URL details
router.get(
    "/details/:url",
    wrapAsync(async (req, res) => {
        const { url } = req.params;

        let urlRecord = await Url.findOne({ shortUrl: url });

        if (!urlRecord) {
            urlRecord = await Url.findOne({ longUrl: decodeURIComponent(url) });
        }

        if (!urlRecord) {
            return res.status(404).json({ error: "URL not found" });
        }

        res.json({
            longUrl: urlRecord.longUrl,
            shortUrl: `${process.env.BACKEND_URL}/redirect/${urlRecord.shortUrl}`,
            hitCount: urlRecord.hitCount,
        });
    })
);

//GET /top/:number
router.get(
    "/top/:number",
    wrapAsync(async (req, res) => {
        const number = Math.min(
            Math.max(parseInt(req.params.number, 10), 1),
            100
        );

        const topUrls = await Url.find()
            .sort({ hitCount: -1 })
            .limit(Number(number));

        const result = topUrls.map((url) => ({
            longUrl: url.longUrl,
            shortUrl: `${process.env.BACKEND_URL}/redirect/${url.shortUrl}`,
            hitCount: url.hitCount,
        }));

        res.json(result);
    })
);

router.get(
    "/:shortUrl",
    wrapAsync(async (req, res) => {
        let { shortUrl } = req.params;
        const existingUrl = await Url.findOne({ shortUrl });
        if (!existingUrl) {
            res.status(404).json({ error: "URL not found", code: 404 });

            return;
        }
        const date = new Date();
        const lastReset = existingUrl.lastReset || existingUrl.lastAccessedAt;
        if (Date.now() - new Date(lastReset).getTime() >= 24 * 60 * 60 * 1000) {
            existingUrl.dailyHitCount = 0;
            existingUrl.lastReset = Date.now();
        }
        if (existingUrl.dailyHitCount >= DAILY_REQUEST_LIMIT) {
            res.status(400).json({ message: "Limit exceeded" });
            return;
        }
        existingUrl.hitCount += 1;
        existingUrl.dailyHitCount += 1;
        existingUrl.lastAccessedAt = date;
        await existingUrl.save();
        if (existingUrl.hitCount % 10 === 0) {
            const randomAdUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
            return res.redirect(randomAdUrl);
        }
        res.redirect(existingUrl.longUrl);
    })
);

module.exports = router;
