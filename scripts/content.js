var Editor = (function(){
    var Editor = {};

    Editor.blockedClass = "WEBFace_Block";

    Editor.highlighterId = "WEBFace_Highlighter";
    Editor.informerId = "WEBFace_Informer";
    Editor.levelId = "WEBFace_Informer_Level";

    Editor.isBlocked = function(element) {
        return $(element).hasClass(Editor.blockedClass);
    }
    Editor.hasMouse = function(event, node) {
        var width = $(node).width();
        var height = $(node).height();
        var offset = $(node).offset();

        if ((event.pageX >= offset.left) && (event.pageX <= offset.left + width) &&
            (event.pageY >= offset.top) && (event.pageY <= offset.top + height)) {
            return true;
        }

        return false;
    }
    Editor.getFocusNode = function(event, parent) {
        var children = $(parent).children();

        for (var i = 0; i < children.length; i++) {
            if (Editor.hasMouse(event, children[i]) && !Editor.isBlocked(children[i])) {
                return children[i];
            }
        }

        return null;
    }
    Editor.getWayToFocusNode = function(event) {
        var node = $("body");
        var nodes = [];

        while(true) {
            node = Editor.getFocusNode(event, node);
            if (node == null) {
                break;
            }
            nodes.push(node);
        }

        return nodes;
    }


    $(document).ready(function(){
        $("body").prepend('<div id="' + Editor.highlighterId + '" class="' + Editor.blockedClass + '"></div>>');
        $("body").prepend('<div id="' + Editor.informerId + '"><span title="Уровень вложенности элементов">Уровень <strong id="' + Editor.levelId + '"></strong></span></div>');

        $("#" + Editor.highlighterId).hide();
        $("#" + Editor.informerId).hide();
    });


    return Editor;
}());

// Content Handler.
var CH = (function(Editor){
    var CH = {};

    // RBM - right mouse button
    // LBM - left mouse button

    CH.CanBlockRedirect = false;

    CH.handleRMB = null;
    CH.handleLMB = null;

    CH.handleMouseEnter = null;
    CH.handleMouseLeave = null;

    CH.NoAct = function() {}

    CH.selectElement = function(element) {
        var width = $(element).width();
        var height = $(element).height();
        var offset = $(element).offset();

        $("#" + Editor.highlighterId).width(width);
        $("#" + Editor.highlighterId).height(height);
        $("#" + Editor.highlighterId).offset({left: offset.left, top: offset.top});

        $("#" + Editor.highlighterId).show();
    }
    CH.deselectElement = function(element) {}
    CH.showElement = function(element) {}
    CH.hideElement = function(element) {}

    CH.idleMode = function() {
        CH.CanBlockRedirect = false;

        CH.handleRMB = CH.NoAct;
        CH.handleLMB = CH.NoAct;
        CH.handleMouseEnter = CH.NoAct;
        CH.handleMouseLeave = CH.NoAct;

        $("#" + Editor.highlighterId).hide();
        $("#" + Editor.informerId).hide();
    }
    CH.editMode = function() {
        CH.CanBlockRedirect = true;

        CH.handleRMB = CH.showElement;
        CH.handleLMB = CH.hideElement;
        CH.handleMouseEnter = CH.selectElement;
        CH.handleMouseLeave = CH.deselectElement;

        $("#" + Editor.informerId).show();
    }

    CH.idleMode();

    return CH;
}(Editor));



// message:
// edit = true/false
// showAll = true/false

// Получает сообщения от фона.
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.edit == true){
        CH.editMode();
    } else {
        CH.idleMode();
    }
});

$(document).ready(function(){
    $(document.body).click(function(event) {
        if (CH.CanBlockRedirect) {
            event.preventDefault();
        }

        var elements = Editor.getWayToFocusNode(event);

        var element = elements[elements.length - 1];
        if (event.button == 0) {
            CH.handleLMB(element);
        } else if (event.button == 2) {
            CH.handleRMB(element);
        }
    });

    $(document.body).mousemove(function(event) {
        var elements = Editor.getWayToFocusNode(event);

        var element = elements[elements.length - 1];

        CH.handleMouseEnter(element);
    });
});
