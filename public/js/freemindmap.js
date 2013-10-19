function MapController(mapArgs) {
    var map = new Map(mapArgs["config"]);
    var canvasWidth, canvasHeight;
    var editor = new Editor(mapArgs);
    var EDITMODE = {NONE:0, EDITING:1, SUBMIT:2};
    var editMode = EDITMODE.NONE;

    this.enter = function(e) { return true; };
    this.insertAfterSibling = function(e) { map.addAfterSibling(); return true; };
    this.insertBeforeSibling = function(e) { map.addBeforeSibling(); return true; };
    this.save = function(e) { return false; };
    this.load = function(e) { return false; };
    this.bold = function(e) { return true; };
    this.italic = function(e) { return true; };
    this.cut = function(e) { map.cut(); return true; };
    this.copy = function(e) { map.copy(); return true; };
    this.paste = function(e) { map.paste(); return true; };
    this.undo = function(e) { return true; };
    this.redo = function(e) { return true; };
    this.directRight = function(e) { map.keyRight(); return true; };
    this.directUp = function(e) { map.keyUp(canvasHeight); return true; };
    this.directLeft = function(e) { map.keyLeft(); return true; };
    this.directDown = function(e) { map.keyDown(canvasHeight); return true; };
    this.altLeft = function(e) { return true; };
    this.altUp = function(e) { map.orderUp(); return true; };
    this.altRight = function(e) { return true; };
    this.altDown = function(e) { map.orderDown(); return true; };
    this.insert = function(e) {
        map.append({"uname":"owner"});
        return true;
    };
    this.delete = function(e) {
        map.remove({"uname":"owner"});
        return true;
    };
    this.home = function(e) { return true; };
    this.f1 = function(e) { return true; };
    this.f2 = function(e) {
        editMode = EDITMODE.EDITING;
        var node = map.getClone({"uname":"owner"});
        editor[node.mimetype](node
            , {13 : function(n) {
                editMode = EDITMODE.SUBMIT;
                map.edit({"uname":"owner", "node":n});
            }, 27 : function(n) {
                editMode = EDITMODE.NONE;
            }, "measure" : function(n) {
                return map.measureWidth(n);
            }});
        return true;
    };

    var editModeFuncs = {
        13 : this.enter,
    };

    var nonEditModeKey = {
        13 : this.insertAfterSibling,
        39 : this.directRight,
        38 : this.directUp,
        37 : this.directLeft,
        40 : this.directDown,
        45 : this.insert,
        46 : this.delete,
        36 : this.home,
        112 : this.f1,
        113 : this.f2,
    };

    var ctrlFuncs = {
        83 : this.save,
        79 : this.load,
        66 : this.bold,
        73 : this.italic,
        88 : this.cut,
        67 : this.copy,
        86 : this.paste,
        89 : this.redo,  // z
        90 : this.undo,  // y
    };

    var altFuncs = {
        37 : this.altLeft,
        38 : this.altUp,
        39 : this.altRight,
        40 : this.altDown,
    }

    var shiftFuncs = {
        13 : this.insertBeforeSibling
    }

    this.FreeMindmapLoad = function (event) {
        var canvas = document.getElementById(mapArgs.mapId);
        var container = document.getElementById(mapArgs.containerId);
        var ctx = canvas.getContext('2d');
        ctx.lineCap = 'round';

        // resize the canvas to fill browser window dynamically
        window.addEventListener('resize', resizeCanvas, false);
        function resizeCanvas() {
            // update canvas size
            canvasWidth = container.offsetWidth;
            canvasHeight = container.offsetHeight;
            canvas.width = container.offsetWidth;
            canvas.height = container.offsetHeight;
            // draw background
            drawAll();
        }
        resizeCanvas();

        function drawAll() {
            // drawBackround
            ctx.fillStyle = mapArgs.config.get('backgroundColor');
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            // draw text
            map.draw({"ctx":ctx, "width":canvas.width, "height":canvas.height});
        }

        // keyevent handler
        window.addEventListener("keydown", keydownHandler, false);
        function keydownHandler(e) {
            keyPropagation = true;
            if(editMode == EDITMODE.NONE) {
                if(e.ctrlKey && ctrlFuncs[e.keyCode]){
                    keyPropagation = ctrlFuncs[e.keyCode](e);
                } else if(e.altKey && altFuncs[e.keyCode]){
                    keyPropagation = altFuncs[e.keyCode](e);
                } else if(e.shiftKey && shiftFuncs[e.keyCode]) {
                    keyPropagation = shiftFuncs[e.keyCode](e);
                } else if(nonEditModeKey[e.keyCode]) {
                    keyPropagation = nonEditModeKey[e.keyCode](e);
                }
                if(!keyPropagation) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                // console.log(e.keyCode);
                drawAll();
            } else if(editMode == EDITMODE.EDITING) {
            } else if(editMode == EDITMODE.SUBMIT) {
                editMode = EDITMODE.NONE;
                drawAll();
            }
            return;
        }

        // mouse event handle
        canvas.addEventListener("mousedown", mousedownHandler, false);
        canvas.addEventListener("mouseup", mouseupHandler, false);
        canvas.addEventListener("mousemove", mousemoveHandler, false);
        canvas.addEventListener("click", mouseClickHandler, false);
        var posDownX, posDownY;
        var downTime, upTime;
        var leftDown = false;
        var lastDrawTime = 0;
        function mousedownHandler(e) {
            if(e.button == 0) {
                posDownX = e.x;
                posDownY = e.y;
                downTime = Date.now();
                leftDown = true;
            }
        }

        function mouseupHandler(e) {
            if(e.button == 0) {
                leftDown = false;
            }
        }

        function mousemoveHandler(e) {
            var currentTime = Date.now();
            if(e.button == 0 && leftDown && currentTime - lastDrawTime > 33) {
                // do drag
                map.moveCanvas({"x":posDownX - e.x, "y":posDownY - e.y});
                posDownX = e.x;
                posDownY = e.y;
                drawAll();
                lastDrawTime = currentTime;
            } else if(!leftDown && currentTime - lastDrawTime > 33) {
                if(map.moveCursor({"x":e.x - canvas.offsetLeft
                    , "y":e.y - canvas.offsetTop})) {
                    drawAll();
                    lastDrawTime = currentTime;
                }
            }
            return;
        }

        function mouseClickHandler(e) {
            if(e.button == 0 && upTime - downTime < 100) {
                // click
                var w = (posDownX - posUpX) * (posDownX - posUpX);
                var h = (posDownY - posUpY) * (posDownY - posUpY);
                if(Math.sqrt(w + h) < 10) {

                } else {

                }
            }
        }
    }

    this.title = function() {
        return map.title();
    }

    this.save = function() {
        return map.toJSON();
    }

    this.load = function(dataStr) {
        return map.fromJSON(dataStr);
    }
}

mm = new MapController({
    config : CreateMapConfig(),
    mapId : "freemindmap",
    containerId : "mapContainer",
    inputTextPlainId : "inputTextPlain"
});

if (window.addEventListener) { // Mozilla, Netscape, Firefox
    window.addEventListener('load', mm.FreeMindmapLoad, false);
} else if (window.attachEvent) { // IE
    window.attachEvent('onload', mm.FreeMindmapLoad);
}