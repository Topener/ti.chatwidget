var moment = require('/alloy/moment');

function toUnix(dateTime) {
    return moment(dateTime).format('X')
}

function toDate(dateTime) {
    return moment(dateTime).format('YYYYMMDD');
}

function toTime(dateTime, format) {
    return moment(dateTime).format(format || 'LTS');
}

function headerDate(dateTime, format) {
    return moment(dateTime).format(format || 'MMMM Do');
}


module.exports = {
    toUnix: toUnix,
    toDate: toDate,
    toTime: toTime,
    headerDate: headerDate
}