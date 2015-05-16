// Storage Manager.
var SM = (function () {

    var my = {};

    my.get = function (key) {
        return localStorage.getItem(key);
    }

    my.put = function (key, value) {
        return localStorage.setItem(key, value);
    }

    my.delete = function (key) {
        return localStorage.removeItem(key);
    }

    return my;

}());

// Event Manager.
var EM = (function() {
    var my = {};

    my.sendMessage = function(passedMessage) {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, passedMessage,
                function(response) { /* Ignore any response. */ }
            );
        });
    }

    my.onMessage = function(message, sender, sendResponse) {
        alert(message);

        my.sendMessage(message);
    };

    chrome.runtime.onMessage.addListener(my.onMessage);

    return my;
}());

// WEB face.
var WF = (function(SM, EM){
    var my = {};

    my.isEditing = false;
    my.isAllShowing = false;

    my.update = function(){
        EM.sendMessage({
            edit: my.isEditing,
            showAll: my.isAllShowing
        });
    }

    return my;
}(SM, EM));