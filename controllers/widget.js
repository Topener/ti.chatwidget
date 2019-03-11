var calcs = require(WPATH('calcs'));

var sections = [];
var messages = {};

// @TODO: backbone listeners
// fetch reset

$.ChatMessages.comparator = function(a,b) {
    return a.attributes.timestamp > b.attributes.timestamp;
}

$.ChatMessages.on('add', onAddMessage);
$.ChatMessages.on('change', onChangeMessage);
$.ChatMessages.on('remove destroy', onRemoveMessage);

function onAddMessage(model) {
    var sectionIndex = findOrCreateSection(model.attributes.dateTime);
    messages[model.attributes.day].push(model.attributes.timestamp);
    messages[model.attributes.day].sort();

    var messagesIndex = messages[model.attributes.day].indexOf(model.attributes.timestamp);
    $.listView.sections[sectionIndex].insertItemsAt(messagesIndex, [generateListItem(model)],{animated: true});
}

function onChangeMessage(model){
    var sectionIndex = findOrCreateSection(model.attributes.dateTime);
    var messagesIndex = messages[model.attributes.day].indexOf(model.attributes.timestamp);
    $.listView.sections[sectionIndex].updateItemAt(messagesIndex, generateListItem(model),{animated: true});
}

function onRemoveMessage (model) {
    var sectionIndex = findOrCreateSection(model.attributes.dateTime);
    var messageIndex = messages[model.attributes.day].indexOf(model.attributes.timestamp);
    
    if (messages[model.attributes.day] && messages[model.attributes.day].length === 1) {
        $.listView.deleteSectionAt(sectionIndex, {animated: true});
        return;
    }
    
    messages[model.attributes.day].splice(messageIndex, 1);
    $.listView.sections[sectionIndex].deleteItemsAt(messageIndex, 1, {animated: true});
}

function generateListItem(model) {
    return {
        template: model.attributes.me ? 'me' : 'other',
        message: {
            text: model.attributes.message
        },
        time: {
            text: calcs.toTime(model.attributes.dateTime)
        },
        timestamp: calcs.toUnix(model.attributes.dateTime)        
    };
}

function findOrCreateSection(dateTime) {
    var sectionIndex = false;
    var date = calcs.toDate(dateTime);

    _.each($.listView.sections, function(section, i) {
        if (section.date === date) {
            sectionIndex = i;
        }
    });

    if (sectionIndex === false) {
        sectionIndex = createSection(dateTime);
    }
    return sectionIndex;
}

function createSection(dateTime) {
    var date = calcs.toDate(dateTime);
    sections.push(date);
    sections.sort();
    messages[date] = [];
    $.listView.insertSectionAt(sections.indexOf(date), Ti.UI.createListSection({
        date: date,
        headerTitle: calcs.headerDate(dateTime)
    }));
    return sections.indexOf(date);

}

exports.addMessage = function(data, bulk) {
    data.day = calcs.toDate(data.dateTime);
    data.timestamp = calcs.toUnix(data.dateTime);

    $.ChatMessages.add(data);

}

exports.addMessages = function(messages) {
    _.each(messages, function(data) {
        exports.addMessage(data, true);
    });
}

exports.updateMessage = function(message) {
    var model = $.ChatMessages.get(message.id);
    model.set(message);
    // @Todo: check if time changes, then remove/re-add
}

exports.removeMessage = function(message) {
    var model = $.ChatMessages.get(message.id);
    $.ChatMessages.remove(model);
}

exports.getCollection = function(){
    return $.ChatMessages;
}