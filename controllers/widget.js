/**
 * TODO:
 * - Ability to take photo/select image to add to message
 * - Display usernames
 * - Display user images
 * - Configuration for header titles
 * - dynamic box width
 * - fix image aspect ratio android
 * - fix toolbar android
 */

var calcs = require(WPATH('calcs'));
var images = require(WPATH('images'));
var moment = require('/alloy/moment');

var sections = [];
var messages = {};
var listviewBottom = 50;
var chatWrapperHeight = 50;
var messageImage;

var config = {
    meMessageBox: {
        backgroundColor: "#AFBF92",
        right: 20,
        left: '20%'
    },
    otherMessageBox: {
        backgroundColor: "#bbb",
        left: 20,
        right: '20%'
    },
    meMessageText: {
        color: "#fff",
        font: {
            fontSize: 14
        }
    },
    otherMessageText: {
        color: "#333",
        font: {
            fontSize: 14
        }
    },
    meMessageTime: {

    }, 
    otherMessageTime: {

    },
    dayHeader: {
        format: "MMMM Do"
    }
};

_.each(config, function(value, prop) {
    if ($.args.hasOwnProperty(prop)) {
        parseConfig(prop, $.args[prop]);
    }
});

function parseConfig(prop, data) {
    _.each(data, function(value, arg) {
        config[prop][arg] = value;
    });
}

if ($.args.__parentSymbol && $.args.__parentSymbol.apiName === 'Ti.UI.Window') {
    var window = $.args.__parentSymbol;
    window.addEventListener('postlayout', init);
} else {
    alert('Chat widget needs to be nested in a window');
}

// @TODO: backbone listeners
// fetch reset

$.ChatMessages.comparator = function(a,b) {
    return a.attributes.timestamp > b.attributes.timestamp;
}

$.ChatMessages.on('add', onAddMessage);
$.ChatMessages.on('change', onChangeMessage);
$.ChatMessages.on('remove destroy', onRemoveMessage);

function onAddMessage(model) {
    if (model.attributes.image) {
        
    }
    var sectionIndex = findOrCreateSection(model.attributes.dateTime);
    messages[model.attributes.day].push(model.attributes.timestamp);
    messages[model.attributes.day].sort();

    var messagesIndex = messages[model.attributes.day].indexOf(model.attributes.timestamp);
    $.listView.sections[sectionIndex].insertItemsAt(messagesIndex, [generateListItem(model)],{animated: true});

    var lastSection = $.listView.sections[$.listView.sections.length - 1];
    setTimeout(scrollToLastItem,250) ;
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

function handleGalleryButton() {
    if (Ti.Media.hasPhotoGalleryPermissions()) {
        selectGalleryImage();
    } else {
        $.trigger('requestPermission', {
            type: 'gallery',
            success: selectGalleryImage
        });
    }
}

function selectGalleryImage() {
    Ti.Media.openPhotoGallery({
        success: function(e) {
            addPhotoToMessage(e.media);
        }
    });
}


function handleCameraButton() {
    if (Ti.Media.hasCameraPermissions()) {
        takePhoto();
    } else {
        $.trigger('requestPermission', {
            type: 'camera',
            success: takePhoto
        });
    }
}

function takePhoto() {
    Ti.Media.showCamera({
        success: function(e) {
            addPhotoToMessage(e.media);
        }
    });
}

function addPhotoToMessage(media) {
    $.imageWrapper.height = 100;
    chatWrapperHeight += $.imageWrapper.height;
    $.chatMessageWrapper.height = chatWrapperHeight + 'dp';
    $.messageImage.image = media;
    messageImage = media;
    setTimeout($.chatBox.focus,1000);
}

function generateListItem(model) {
    var textObject = model.attributes.me ? config.meMessageText : config.otherMessageText;
    textObject.text = model.attributes.message;

    var timeTextObject = model.attributes.me ? config.meMessageTime : config.otherMessageTime;
    timeTextObject.text = calcs.toTime(model.attributes.dateTime, timeTextObject.format);

    var template = model.attributes.me ? 'me' : 'other';

    var imageObject = {};

    if (model.attributes.image) {
        template += 'Image';

        var localImage = images.getLocalImage(model);


        // TODO: move to lib
        if (localImage) {
            
            var boxWidth = Ti.Platform.displayCaps.platformWidth;

            // TODO: clean up next line
            _.each([config[model.attributes.me ? 'meMessageBox' : 'otherMessageBox'].left, config[model.attributes.me ? 'meMessageBox' : 'otherMessageBox'].right], function(amount) {
                if (typeof amount === 'string' && amount.indexOf('%')) {
                    amount = parseInt(amount.replace('%', ''));
                    boxWidth -= Ti.Platform.displayCaps.platformWidth / 100 * amount;
                } else {
                    boxWidth -= parseInt(amount);
                }
            });

            var imageWidth = boxWidth;
            var imageHeight = 0;

            if (localImage.width > boxWidth) {
                var ratio = boxWidth / localImage.width;
                imageHeight = localImage.height * ratio;
            } else {
                imageWidth = localImage.width;
                imageHeight = localImage.height
            }

            imageObject.image =localImage;
            imageObject.height = imageHeight;
            imageObject.width = imageWidth;
            textObject.top = imageHeight + 6;
        } else {
            imageObject.image = WPATH('/images/placeholder.png');
            imageObject.height = 100;
            imageObject.width = 300;
            textObject.top = 106;
            images.fetchImage(model.toJSON(), exports.updateMessage);
        }
    }

    return {
        template: template,
        message: textObject,
        time: timeTextObject,
        timestamp: calcs.toUnix(model.attributes.dateTime),
        wrapper: model.attributes.me ? config.meMessageBox : config.otherMessageBox,
        image: imageObject
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
        headerTitle: calcs.headerDate(dateTime, config.dayHeader.format)
    }));
    return sections.indexOf(date);

}

function handleKeyboardChange(e){

    var platformHeight = Ti.Platform.displayCaps.platformHeight;
    chatWrapperHeight = platformHeight - e.keyboardFrame.y + listviewBottom - (platformHeight !== e.keyboardFrame.y ? window.safeAreaPadding.bottom : 0);
    chatWrapperHeight += $.imageWrapper.height;
    $.chatMessageWrapper.animate({
        height: chatWrapperHeight,
        duration: e.animationDuration * 1000
    });

    $.listView.animate({
        bottom: platformHeight - e.keyboardFrame.y + listviewBottom - (platformHeight !== e.keyboardFrame.y ? window.safeAreaPadding.bottom : 0),
        duration: e.animationDuration * 1000
    }, scrollToLastItem);
}



function scrollToLastItem() {
    var lastSection = $.listView.sections[$.listView.sections.length - 1];
    $.listView.scrollToItem($.listView.sections.length - 1, lastSection.items.length -1, {animated: false});
}

function sendMessage() {
    var text = $.chatBox.value;

    if (text.length === 0 && !$.messageImage.image) {
        return false;
    }

    $.chatBox.value = '';
    handleMessageChange();
    
    // @TODO: Make sure textfield remains focussed

    var message = {
        me: true,
        message: text,
        dateTime: moment(new Date()).format(),
        id: new Date().getTime(),
    };

    if (messageImage) {
        message.image = messageImage;
        messageImage = false;
        $.messageImage.image = null;
        chatWrapperHeight -= $.imageWrapper.height;
        $.imageWrapper.height = 0;
        $.chatMessageWrapper.height = chatWrapperHeight + 'dp';
    
    }
    
    exports.addMessage(message);
    
    $.trigger('addedMessage', {
        message: message,
        updateId: updateId
    });

}

function updateId(oldId, newId) {
    var model = $.ChatMessages.get(oldId);
    model.set({id: newId});
}

var lastLength = 0;
function handleMessageChange() {
    if ($.chatBox.value.length > 0 && lastLength == 0) {
        $.chatBox.animate({
            right: 50,
            duration: 250
        });

        $.sendMessageWrapper.animate({
            opacity: 1,
            duration: 250
        });
    }
    else if ($.chatBox.value.length === 0 && lastLength !== 0) {
        $.chatBox.animate({
            right: 10,
            duration: 250
        });
        $.sendMessageWrapper.animate({
            opacity: 0,
            duration: 250
        });
    }
    lastLength = $.chatBox.value.length;
}

function handleMessageClick(e) {
    $.chatBox.blur();
}

function handleFocus() {
    if (OS_IOS) return;
    setTimeout(scrollToLastItem,500);
}

function init() {
    window.removeEventListener('postlayout', init);
    
    listviewBottom = 50 + window.safeAreaPadding.bottom;
    chatWrapperHeight = listviewBottom;

    $.chatMessageWrapper.height = chatWrapperHeight + 'dp';
    $.listView.bottom = listviewBottom + 'dp';

    if (OS_IOS) Ti.App.addEventListener('keyboardframechanged', handleKeyboardChange);
}

exports.addMessage = function(data) {
    data.day = calcs.toDate(data.dateTime);
    data.timestamp = calcs.toUnix(data.dateTime);

    $.ChatMessages.add(data);

}

exports.addMessages = function(messages) {
    _.each(messages, function(data) {
        exports.addMessage(data);
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
