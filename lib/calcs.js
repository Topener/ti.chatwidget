var moment = require('/alloy/moment');

function toUnix(dateTime) {
    return moment(dateTime).format('X')
}

function toDate(dateTime) {
    return moment(dateTime).format('YYYYMMDD');
}

function toTime(dateTime) {
    return moment(dateTime).format('LTS');
}

function headerDate(dateTime) {
    return moment(dateTime).format('MMMM Do');
}


module.exports = {
    toUnix: toUnix,
    toDate: toDate,
    toTime: toTime,
    headerDate: headerDate
}