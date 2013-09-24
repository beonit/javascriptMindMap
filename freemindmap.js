function MapController(mapArgs) {
    var map = new Map(mapArgs["config"]);
    var editMode = false;
    var canvasWidth, canvasHeight;

    this.enter = function() { return true; };
    this.save = function() { return false; };
    this.load = function() { return false; };
    this.bold = function() { return true; };
    this.italic = function() { return true; };
    this.cut = function() { return true; };
    this.copy = function() { return true; };
    this.paste = function() { return true; };
    this.undo = function() { return true; };
    this.redo = function() { return true; };
    this.directRight = function() { map.keyRight(); return true; };
    this.directUp = function() { map.keyUp(canvasHeight); return true; };
    this.directLeft = function() { map.keyLeft(); return true; };
    this.directDown = function() { map.keyDown(canvasHeight); return true; };
    this.altLeft = function() { return true; };
    this.altUp = function() { map.orderUp(); return true; };
    this.altRight = function() { return true; };
    this.altDown = function() { map.orderDown(); return true; };
    this.insert = function() {
        map.append({"uname":"owner"});
        return true;
    };
    this.delete = function() {
        map.remove({"uname":"owner"});
        return true;
    };
    this.home = function() { return true; };
    this.f1 = function() { return true; };
    this.f2 = function() { return true; };

    var editModeFuncs = {
        13 : this.enter,
    };

    var nonEditModeKey = {
        39 : this.directRight,
        38 : this.directUp,
        37 : this.directLeft,
        40 : this.directDown,
        45 : this.insert,
        46 : this.delete,
        36 : this.home,
        112 : this.f1,
        112 : this.f2,
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

    this.FreeMindmapLoad = function (event) {
        var canvas = document.getElementById(mapArgs.mapId),
        container = document.getElementById(mapArgs.containerId),
        ctx = canvas.getContext('2d');

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
            if(editMode) {
                if(editModeFuncs[e.keyCode] != null) {
                    keyPropagation = editModeFuncs[e.keyCode]();
                }
            } else if(e.ctrlKey){
                if(ctrlFuncs[e.keyCode] != null) {
                    keyPropagation = ctrlFuncs[e.keyCode]();
                }
            } else if(e.altKey){
                if(altFuncs[e.keyCode] != null) {
                    keyPropagation = altFuncs[e.keyCode]();
                }
            } else if(nonEditModeKey[e.keyCode] != null) {
                keyPropagation = nonEditModeKey[e.keyCode]();
            }
            if(!keyPropagation) {
                e.preventDefault();
                e.stopPropagation();
            }
            // console.log(e.keyCode);
            drawAll();
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
                map.moveRoot({"x":posDownX - e.x, "y":posDownY - e.y});
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
}

mm = new MapController({
    config : CreateMapConfig(),
    mapId : "freemindmap",
    containerId : "mapContainer"});

if (window.addEventListener) { // Mozilla, Netscape, Firefox
    window.addEventListener('load', mm.FreeMindmapLoad, false);
} else if (window.attachEvent) { // IE
    window.attachEvent('onload', mm.FreeMindmapLoad);
}