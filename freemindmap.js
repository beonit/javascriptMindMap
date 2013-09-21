function MapController(mapArgs) {
    var rootX = 0, rootY = 0;
    var map = new Map(mapArgs["config"]), invalidate = map.REDRAW.NONE;
    var editMode = false, redrawMode = false;

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
    this.directRight = function() { return true; };
    this.directUp = function() { return true; };
    this.directLeft = function() { return true; };
    this.directDown = function() { return true; };
    this.directRight = function() { return true; };
    this.altLeft = function() { return true; };
    this.altUp = function() { return true; };
    this.altRight = function() { return true; };
    this.altDown = function() { return true; };
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
            canvas.width = container.offsetWidth;
            canvas.height = container.offsetHeight;

            // draw background
            drawAll(map.REDRAW.ALL);
        }
        resizeCanvas();

        function drawAll(mode) {
            // drawBackround
            ctx.fillStyle = mapArgs.config.get('backgroundColor');
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // draw text
            rootX = canvas.width / 2;
            rootY = canvas.height / 2;
            map.draw({"ctx":ctx, "x":rootX, "y":rootY, "mode":mode});
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
            drawAll(map.REDRAW.NODE_ONLY);
            return;
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