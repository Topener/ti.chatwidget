function getLocalImage(model) {
    console.log(model.toJSON());
    if (model.attributes.localImage) {
        return model.attributes.localImage;
    }

    if (typeof model.attributes.image === 'object' && model.attributes.image.height) {
        return model.attributes.image;
    }

    if (model.attributes.image.indexOf('http') === -1) {
        var file = Ti.Filesystem.getFile(model.attributes.image);
        if (file.exists()){
            return file.read();
        } else if (OS_IOS) {
            return Ti.Filesystem.getAsset(model.attributes.image);
        }

    }

    return false;
}

function fetchImage(model, updateMessage) {

    if (!model.image) {
        return console.error('model doesn\'t have an image');
    }

    if (typeof model.image === 'object' && model.image.height) {
        model.localImage = model.image;
        console.warn(model);

        setTimeout(function() {
            updateMessage(model);
        },1000);
        return;
    }

    fetchRemoteImage(model.image, function(blob) {
        setTimeout(function() {
            model.localImage = blob;
            updateMessage(model);
        },1000);
    });

}

function fetchRemoteImage(url, callback) {
    var client = Ti.Network.createHTTPClient({
        // function called when the response data is available
        onload : function(e) {
            callback(this.responseData);
            
        },
        // function called when an error occurs, including a timeout
        onerror : function(e) {
            Ti.API.debug(e.error);
            alert('error');
        },
        timeout : 5000  // in milliseconds
    });
    // Prepare the connection.
    client.open("GET", url);
    // Send the request.
    client.send();    
}

module.exports = {
    getLocalImage: getLocalImage,
    fetchImage: fetchImage
}