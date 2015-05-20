////////////////////////////////////////////////////////////////////////////////
// Расширение классов

Node.prototype.hasMouse = function(event) {
    var elem = $(this);

    var width = elem.width();
    var height = elem.height();
    var offset = elem.offset();

    if ((event.pageX >= offset.left) && (event.pageX <= offset.left + width) &&
        (event.pageY >= offset.top) && (event.pageY <= offset.top + height)) {
        return true;
    }

    return false;
}

HTMLDocument.prototype.getElementByMap = function(map) {
    var parent = this;
    var children = $(parent).children();

    for (var i = 0; i < map.length; i++) {
        if (i == map.length - 1) {
            return children[map[i]];
        }

        children = $(children[map[i]]).children();
    }

    return parent;
}

HTMLDocument.prototype.getMapsOfFocusedElements = function(event, parentMap) {
    parentMap = parentMap || new Map();

    var parent = document.getElementByMap(parentMap);
    var children = $(parent).children();
    var nodes = [];

    for (var i = 0; i < children.length; i++)
    {
        var map = parentMap.clone();
        map.push(i);

        if (children[i].hasMouse(event)) {
            nodes.push(map);
        }

        var focusedNodes = document.getMapsOfFocusedElements(event, map);
        for (var j = 0; j < focusedNodes.length; j++) {
            nodes.push(focusedNodes[j]);
        }
    }

    return nodes;
}

////////////////////////////////////////////////////////////////////////////////
// Map - карта доступа в DOM к элементу

function Map(string) {
    this.length = 0;

    if (string) {
        var arr = string.split(" ");
        for (var i = 0; i < arr.length; i++) {
            this.push(arr[i]);
        }
    }
}

Map.prototype.push = function(value) {
    this[this.length] = value;
    this.length += 1;
}

Map.prototype.clone = function(){
    var map = new Map();

    for (var i = 0; i < this.length; i++) {
        map.push(this[i]);
    }

    return map;
}

Map.prototype.toMap = function(string) {
    var map = new Map();
    var arr = string.split(" ");

    for (var i = 0; i < arr.length; i++) {
        map.push(arr[i]);
    }

    return map;
}
Map.prototype.toString = function() {
    return Array.prototype.join.call(this, " ");
}

////////////////////////////////////////////////////////////////////////////////
// WFObject - базовый класс для объектов, которые будут добавляться
// на страницу.

function WFObject(id) {
    this._id = id;

    var obj = this;
    $(document).ready(function(){
        obj.init();
    });
}

WFObject.prototype.hide = function() {
    var elem = document.getElementById(this._id);
    $(elem).hide();
}
WFObject.prototype.show = function() {
    var elem = document.getElementById(this._id);
    $(elem).show();
}

WFObject.prototype.init = function() {}

////////////////////////////////////////////////////////////////////////////////
// Highlighter - html-блок, который подсвечивает элементы.

function Highlighter(id) {
    WFObject.apply(this, [id]);
}

Highlighter.prototype = Object.create(WFObject.prototype);
Highlighter.prototype.constructor = Highlighter;

Highlighter.prototype.highlight = function(element) {
    var highlighter = $(document.getElementById(this._id));

    this.show();

    highlighter.width($(element).width());
    highlighter.height($(element).height());
    highlighter.offset($(element).offset());
}

Highlighter.prototype.init = function() {
    $(document.body).prepend('<div id="' + this._id + '"></div>>');

    this.hide();
}

////////////////////////////////////////////////////////////////////////////////
// InfoWin - html-окно, в котором список элементов.

function InfoWin(id, caption, buttonName) {
    WFObject.apply(this, [id]);

    this._caption = caption;
    this._buttonName = buttonName;
}

InfoWin.prototype = Object.create(WFObject.prototype);
InfoWin.prototype.constructor = InfoWin;


InfoWin.prototype.onMouseEnterWin = function(event, win) {};
InfoWin.prototype.onMouseLeaveWin = function(event, win) {};
InfoWin.prototype.onMouseEnterNode = function(event, node) {};
InfoWin.prototype.onMouseLeaveNode = function(event, node) {};
InfoWin.prototype.onMouseClickNode = function(event, node) {};

InfoWin.prototype.clearList = function() {
    var elem = document.getElementById(this._id).getElementsByClassName("List")[0];
    $(elem).html("");
}

InfoWin.prototype.addNode = function(name, map) {
    var self = this;
    var list = document.getElementById(this._id).getElementsByClassName("List")[0];

    $(list).append('<div class="Node">' +
                       '<span class="Info" title="' + name + '">' + name + '</span>' +
                       '<input type="button" class="Submit" name="Submit" value="' + this._buttonName + '" />' +
                       '<input type="hidden" name="Map" value="' + map + '"/>' +
                    '</div>');

    var node = $(list).find(".Node:last");
    var button = $(node).find("input[name='Submit']");

    $(node).mouseenter(function(e) { self.onMouseEnterNode(e, this); });
    $(node).mouseleave(function(e) { self.onMouseLeaveNode(e, this); });

    $(button).click(function(e) { self.onMouseClickNode(e, this.parentNode); });
}

InfoWin.prototype.init = function() {
    $(document.body).prepend('<div id="' + this._id + '" class="InfoWin">' +
                                 '<h3 class="Caption">' + this._caption + '</h3>' +
                                 '<hr class="Separator"/>' +
                                 '<div class="List"></div>' +
                             '</div>');

    var self = this;
    var win = document.getElementById(this._id);

    $(win).draggable();

    $(win).mouseenter(function(e) { self.onMouseEnterWin(e, this); });
    $(win).mouseleave(function(e) { self.onMouseLeaveWin(e, this); });

    this.hide();
}

// Content Handler.
var CH = (function(){
    var CH = {};

    var highlighter = new Highlighter("WEBFace_Highlighter");

    var informer = new InfoWin("WEBFace_CurrentElements", "Активные элементы", "Спрятать");
    informer.onMouseEnterWin = function(event, win) {
        CH.initIdleHandlers();
    }
    informer.onMouseLeaveWin = function(event, win) {
        CH.initEditHandlers();
    }
    informer.onMouseEnterNode = function(event, node) {
        var value = $(node).find("input[name='Map']").val();
        var map = Map.prototype.toMap(value);
        var elem = document.getElementByMap(map);
        highlighter.highlight(elem);
    }
    informer.onMouseLeaveNode = function(event, node) {
        highlighter.hide();
    }
    informer.onMouseClickNode = function(event, node) {
        alert("click");
    }

    var repairer = new InfoWin("WEBFace_RemovedElements", "Удалённые элементы", "Воостановить");

    CH.CanRedirect = true;
    CH.handleLMB = null;

    CH.NoAct = function() {}
    CH.AddFocusedNodes = function(event) {
        var maps = document.getMapsOfFocusedElements(event);
        informer.clearList();
        for (var i = 0; i < maps.length; i++) {
            informer.addNode("Level " + i, maps[i].toString());
        }
    }

    CH.initIdleHandlers = function() {
        CH.handleLMB = CH.NoAct;
    }
    CH.initEditHandlers = function() {
        CH.handleLMB = CH.AddFocusedNodes;
    }

    CH.idleMode = function() {
        CH.CanRedirect = true;

        CH.initIdleHandlers();

        informer.hide();
        highlighter.hide();
    }
    CH.editMode = function() {
        CH.CanRedirect = false;

        CH.initEditHandlers();

        informer.show();
        repairer.show();
    }


    CH.idleMode();

    return CH;
}());

// message:
// edit = true/false

// Получает сообщения от фона.
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.edit == true){
        CH.editMode();
    } else {
        CH.idleMode();
    }
});

HTMLDocument.prototype.writeLine = function(text){
    this.write(text);
    this.write("<br />");
};

$(document).ready(function(){
    $(document.body).click(function(event) {
        if (!CH.CanRedirect) {
            event.preventDefault();
        }

        if (event.button == 0) {
            CH.handleLMB(event);
        }
    });
});
