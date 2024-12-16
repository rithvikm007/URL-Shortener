function getDateMonthYear(timestamp = Date.now()) {
    const date = new Date(timestamp);
    const day = date.getUTCDate();
    const month = date.getUTCMonth() + 1;
    const year = date.getUTCFullYear();

    return { day, month, year };
}

module.exports = getDateMonthYear;
