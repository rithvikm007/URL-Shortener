const express = require("express");
const router = express.Router();
const Url = require("../models/url");
const User = require("../models/user");
const generateShortUrl = require("../utils/generateShortUrl");
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn, isAdmin } = require("../middleware");
require("dotenv").config();

router.get("/shorten", isLoggedIn, (req, res) => {
    res.render("url/shorten", { shortUrl: null });
});

router.get(
    "/show/admin",
    isAdmin,
    wrapAsync(async (req, res) => {
        const allUrls = await Url.find().populate("user");

        res.render("admin/show", { urls: allUrls, user: req.user });
    })
);

router.get(
    "/show",
    isLoggedIn,
    wrapAsync(async (req, res) => {
        const allUrls = await Url.find({ user: req.user._id });

        res.render("url/show", { urls: allUrls, user: req.user });
    })
);

router.post(
    "/shorten",
    isLoggedIn,
    wrapAsync(async (req, res) => {
        const { longUrl } = req.body;
        if (!req.body) {
            res.render("url/shorten", {
                shortUrl: null,
            });
            return;
        }
        const userUrlsCount = await Url.countDocuments({ user: req.user._id });
        if (userUrlsCount >= process.env.USER_URL_LIMIT) {
            req.flash(
                "error",
                `You can only have a maximum of ${process.env.USER_URL_LIMIT} URLs. Please delete some URLs before creating a new one.`
            );
            return res.redirect("/show");
        }
        let url = await Url.findOne({ longUrl });
        if (url) {
            res.render("url/shorten", {
                shortUrl: `${url.shortUrl}`,
            });
            return;
        }
        let shortUrl;
        let urlExists = true;
        while (urlExists) {
            shortUrl = await generateShortUrl();
            urlExists = await Url.findOne({ shortUrl });
        }
        shortUrl = process.env.BACKEND_URL + "/" + shortUrl;

        url = new Url({
            longUrl,
            shortUrl,
            hitCount: 0,
            dailyHitCount: 0,
            lastAccessedAt: new Date(),
            user: req.user._id,
        });
        await url.save();
        await User.findByIdAndUpdate(req.user._id, {
            $push: { urls: url._id },
        });
        res.render("url/shorten", {
            shortUrl: `${shortUrl}`,
        });
    })
);

router.get(
    "/redirect/:shortUrl",
    wrapAsync(async (req, res) => {
        let { shortUrl } = req.params;
        shortUrl = decodeURIComponent(shortUrl);
        const existingUrl = await Url.findOne({ shortUrl });
        if (!existingUrl) {
            req.flash("error", "URL not found");
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
            const randomAdUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
            return res.redirect(randomAdUrl);
        }
        res.redirect(existingUrl.longUrl);
    })
);

router.delete(
    "/:shortUrl",
    isLoggedIn,
    wrapAsync(async (req, res) => {
        const { shortUrl } = req.params;
        const encodedShortUrl = req.body.encodedShortUrl;

        const decodedShortUrl = decodeURIComponent(encodedShortUrl);

        const url = await Url.findOneAndDelete({ shortUrl: decodedShortUrl });
        if (!url) {
            req.flash("error", "URL not found");
            return res.redirect("show");
        }

        await User.findByIdAndUpdate(req.user._id, {
            $pull: { urls: url._id },
        });

        req.flash("success", "URL deleted successfully");
        res.redirect("show");
    })
);

// Route to display URL details
router.get(
    "/details/:url",
    wrapAsync(async (req, res) => {
        const { url } = req.params;
        const decodedUrl = decodeURIComponent(url);

        let urlRecord = await Url.findOne({ shortUrl: decodedUrl });

        if (!urlRecord) {
            urlRecord = await Url.findOne({ longUrl: decodedUrl });
        }
        if (!urlRecord) {
            return res.status(404).json({ error: "URL not found" });
        }

        res.json({
            longUrl: urlRecord.longUrl,
            shortUrl: urlRecord.shortUrl,
            hitCount: urlRecord.hitCount,
        });
    })
);

//GET /top/:number
router.get(
    "/top/:number",
    wrapAsync(async (req, res) => {
        const { number } = req.params;

        const topUrls = await Url.find()
            .sort({ hitCount: -1 })
            .limit(Number(number));

        const result = topUrls.map((url) => ({
            longUrl: url.longUrl,
            shortUrl: url.shortUrl,
            hitCount: url.hitCount,
        }));

        res.json(result);
    })
);

module.exports = router;
