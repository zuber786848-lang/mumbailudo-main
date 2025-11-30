function parseDateString(dateStr) {
    const [day, month, year] = dateStr.split('/');
    return new Date(Date.UTC(year, month - 1, day));
}
module.exports = { parseDateString }
