const Url = require("../models/url");

const base62 = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const base62encode = (num, length = 6) => {
    let str = "";
    while (num > 0) {
        str = base62[num % 62] + str;
        num = Math.floor(num / 62);
    }
    return str.padStart(length, "f");
};

const generateShortUrl = async () => {
    let shortUrl;
    do {
        const time = Date.now();
        const randomNum = Math.floor(Math.random() * 1000000);
        shortUrl = base62encode(time + randomNum);

        const url = await Url.findOne({ shortUrl });
        if (!url) {
            return shortUrl;
        }
    } while (true);

    return shortUrl;
};
