const express = require("express");
const router = express.Router();
const Url = require("../models/url");
const User = require("../models/user");
const generateShortUrl = require("../utils/generateShortUrl");
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn } = require("../middleware");
require("dotenv").config();

router.get("/shorten", isLoggedIn, (req, res) => {
    res.render("url/shorten", { shortUrl: null });
});

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
            res.render("url/index", {
                shortUrl: null,
            });
            return;
        }
        const userUrlsCount = await Url.countDocuments({ user: req.user._id });
        if (userUrlsCount >= process.env.USER_URL_LIMIT) {
            req.flash("error", "You can only have a maximum of 5 URLs.");
            return res.redirect("/show");
        }
        let url = await Url.findOne({ longUrl });
        if (url) {
            res.render("url/index", {
                shortUrl: `http://localhost:8080/${url.shortUrl}`,
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
            user: req.user._id,
        });
        await url.save();
        await User.findByIdAndUpdate(req.user._id, {
            $push: { urls: url._id },
        });
        res.render("url/index", {
            shortUrl: `http://localhost:8080/${shortUrl}`,
        });
    })
);

router.get(
    "/:shortUrl",
    wrapAsync(async (req, res) => {
        const { shortUrl } = req.params;
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
        const url = await Url.findOneAndDelete({ shortUrl });
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

router.get(
    "/details/:url",
    isLoggedIn,
    wrapAsync(async (req, res) => {
        const { url } = req.params;

        const decodedUrl = decodeURIComponent(url);

        let urlRecord;
        if (decodedUrl.startsWith("http://localhost:8080/")) {
            const shortUrl = decodedUrl.replace("http://localhost:8080/", "");
            urlRecord = await Url.findOne({ shortUrl });
        } else {
            urlRecord = await Url.findOne({ longUrl: decodedUrl });
        }

        if (!urlRecord) {
            return res.status(404).json({ message: "URL not found" });
        }

        res.json({ hitCount: urlRecord.hitCount });
    })
);
router.get(
    "/top/:number",
    isLoggedIn,
    wrapAsync(async (req, res) => {
        const { number } = req.params;
        const topUrls = await Url.find()
            .sort({ hitCount: -1 })
            .limit(parseInt(number))
            .select("longUrl shortUrl hitCount -_id");

        res.json(topUrls);
    })
);

module.exports = router;
