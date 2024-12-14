const express = require("express");
const passport = require("passport");
const User = require("../models/user");
const { saveRedirectUrl } = require("../middleware");
const router = express.Router();

router.get("/signup", (req, res) => {
    res.render("signup");
});

router.post("/signup", async (req, res, next) => {
    try {
        const { username, password, email } = req.body;
        const newUser = new User({ username, email });

        const registeredUser = await User.register(newUser, password);
        req.login(registeredUser, (err) => {
            if (err) return next(err);
            req.flash("success", "Successfully signed up!");
            res.redirect("/");
        });
    } catch (err) {
        req.flash("error", err.message);
        res.redirect("/user/signup");
    }
});

router.get("/login", (req, res) => {
    res.render("login");
});

router.post(
    "/login",
    saveRedirectUrl,
    passport.authenticate("local", {
        failureRedirect: "/user/login",
        failureFlash: true,
    }),
    async (req, res) => {
        req.flash("success", "Welcome back");
        // console.log("Redirect URL (after login):", res.locals);
        res.redirect(res.locals.redirectUrl || "/");
    }
);

router.get("/logout", (req, res) => {
    const redirectUrl = res.locals.redirectUrl || "/";
    // console.log("Redirect URL (on logout):", redirectUrl);

    req.logout((err) => {
        if (err) return next(err);
        req.flash("success", "You have successfully logged out.");
        res.redirect(redirectUrl);
    });
});

module.exports = router;
