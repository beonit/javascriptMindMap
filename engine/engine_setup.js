function engineLoadEvent(config, map, normalKey, editKey, typeEditKey,
                         ctrlKey, altKey, shiftKey) {
    var ctx, canvas, container;
    var EDITMODE = {NONE:0, EDITING:1, SUBMIT:2};
    var editMode = EDITMODE.NONE;
    var posDownX, posDownY;
    var downTime, upTime;
    var leftDown = false;
    var lastDrawTime = 0;

    var drawAll = function() {
        // drawBackround
        ctx.fillStyle = gMapConfig.get('backgroundColor');
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // draw text
        map.draw({"ctx":ctx, "width":canvas.width, "height":canvas.height});
    };
    map.drawAll = drawAll;

    var resizeCanvas = function() {
        map.setWithHeight(container.offsetWidth, container.offsetHeight);
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
        // draw background
        drawAll();
    };

    var keydownHandler = function(e) {
        var keyPropagation = true;
        if(editMode == EDITMODE.NONE) {
            if(e.ctrlKey && ctrlKey[e.keyCode]){
                keyPropagation = ctrlKey[e.keyCode](e);
            } else if(e.altKey && altKey[e.keyCode]){
                keyPropagation = altKey[e.keyCode](e);
            } else if(e.shiftKey && shiftKey[e.keyCode]) {
                keyPropagation = shiftKey[e.keyCode](e);
            } else if(e.altKey == typeEditKey.alt &&
                      e.ctrlKey == typeEditKey.ctrl &&
                      e.shiftKey == typeEditKey.shift &&
                      e.keyCode == typeEditKey.keycode) {
                if(editMode == EDITMODE.EDITING) {
                    return false;
                }
                editMode = EDITMODE.EDITING;
                var finishCallback = function() {
                    editMode = EDITMODE.NONE;
                    drawAll();
                };
                map.startTypeEdit(finishCallback);
            } else if(e.altKey == editKey.alt &&
                      e.ctrlKey == editKey.ctrl &&
                      e.shiftKey == editKey.shift &&
                      e.keyCode == editKey.keycode) {
                if(editMode == EDITMODE.EDITING) {
                    return false;
                }
                editMode = EDITMODE.EDITING;
                var finishCallback = function() {
                    editMode = EDITMODE.NONE;
                    drawAll();
                };
                map.startEdit(ctx, finishCallback);
            } else if(normalKey[e.keyCode]) {
                keyPropagation = normalKey[e.keyCode](e);
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
    };

    var mousedownHandler = function(e) {
        if(e.button == 0) {
            posDownX = e.x;
            posDownY = e.y;
            downTime = Date.now();
            leftDown = true;
        }
    }

    var mouseupHandler = function(e) {
        if(e.button == 0) {
            leftDown = false;
        }
    }

    var mousemoveHandler = function(e) {
        var currentTime = Date.now();
        if(e.button == 0 && leftDown && currentTime - lastDrawTime > 33) {
            if(editMode == EDITMODE.EDITING) {
                map.submitEdit();
            }
            map.moveCanvas({"x":posDownX - e.x, "y":posDownY - e.y});
            posDownX = e.x;
            posDownY = e.y;
            drawAll();
            lastDrawTime = currentTime;
        }
        return;
    }

    var mouseClickHandler = function(e) {
        if(editMode == EDITMODE.EDITING) {
            map.submitEdit();
        } else if(e.button == 0) {
            if(map.moveCursor(e.x, e.y)) {
                drawAll();
            }
        }
    }

    return function(event) {
        container = document.getElementById(gMapConfig.get("containerId"));
        canvas = document.getElementById(gMapConfig.get("mapId"));
        ctx = canvas.getContext('2d');
        ctx.lineCap = 'round';

        window.addEventListener('resize', resizeCanvas, false);
        window.addEventListener("keydown", keydownHandler, false);
        canvas.addEventListener("mousedown", mousedownHandler, false);
        canvas.addEventListener("mouseup", mouseupHandler, false);
        canvas.addEventListener("mousemove", mousemoveHandler, false);
        canvas.addEventListener("click", mouseClickHandler, false);
        resizeCanvas();
    };

};
