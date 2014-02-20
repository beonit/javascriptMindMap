var gMapConfig = (function() {
    var private = {
        'backgroundColor' : "#FFFFFF",
        'marginNodeTop' : 15,
        'marginNodeLeft' : 40,
        'cursorColor' : "#CCCCCC",
        'cursorMargin' : 3,
        'mapId' : "freemindmap",
        'containerId' : "mapContainer",
    };

    return {
        get: function(name) { return private[name]; },
        set: function(name, value) { private[name] = value; },
        toJSON: function() { return JSON.stringify(private); }
    }
})();

var nodePlugins = {};
var engine = new Map(nodePlugins);

var container = document.getElementById(gMapConfig.get("containerId"));
nodePlugins["text/plain"] = new node_textplain(container, engine);
nodePlugins["text/uri"] = new node_texturi(container, engine, "freemindmap");

var keyMapper = KeyMapper(engine);

var editKey = {
    113 : true
};

var normalKey = {
    13 : keyMapper.addSiblingAfter,
    32 : keyMapper.fold,
    39 : keyMapper.directRight,
    38 : keyMapper.directUp,
    37 : keyMapper.directLeft,
    40 : keyMapper.directDown,
    45 : keyMapper.insert,
    46 : keyMapper.delete,
    36 : keyMapper.home,
    112 : keyMapper.f1,
};

var ctrlKey = {
    83 : keyMapper.save,
    79 : keyMapper.load,
    66 : keyMapper.bold,
    73 : keyMapper.italic,
    88 : keyMapper.cut,
    67 : keyMapper.copy,
    86 : keyMapper.paste,
    89 : keyMapper.redo, // y
    90 : keyMapper.undo, // z
};

var altKey = {
    37 : keyMapper.altLeft,
    38 : keyMapper.altUp,
    39 : keyMapper.altRight,
    40 : keyMapper.altDown,
}

var shiftKey = {
    13 : keyMapper.addSiblingBefore
}

// init engine object
var engineOnload = engineLoadEvent(gMapConfig, engine, normalKey, editKey,
                                ctrlKey, altKey, shiftKey);

if (window.addEventListener) { // Mozilla, Netscape, Firefox
    window.addEventListener('load', engineOnload, false);
} else if (window.attachEvent) { // IE
    window.attachEvent('onload', engineOnload);
}
