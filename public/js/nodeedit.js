function Editor(mapArgs) {

    var dragFunc, clickFunc;

    var editTextPlain = function(n, drawInfo, keyCallbacks, callbacks) {
        var input = document.getElementById(mapArgs.inputTextPlainId);
        input.style.left = drawInfo.drawPos.start.x + "px";
        input.style.top = drawInfo.drawPos.start.y + "px";
        input.style.width = drawInfo.measure.width + 10 + "px";
        input.value = n.data;
        input.style.display = "block";
        input.focus();
        input.select();
        var minWidth = drawInfo.measure.width;
        var keyListener = function(e) {
            n.data = input.value;
            var newWidth = callbacks["measure"](n);
            if(keyCallbacks[e.keyCode]) {
                input.removeEventListener("keydown", keyListener, false);
                input.style.display = "none";
                keyCallbacks[e.keyCode](n);
            }
            if(newWidth > minWidth) {
                input.style.width = newWidth + 10 + "px";
            }
        };
        input.addEventListener("keydown", keyListener, false);
        var submitFunc = function(x, y) {
            n.data = input.value;
            input.removeEventListener("keydown", keyListener, false);
            input.style.display = "none";
            callbacks["submit"](n);
        };
        clickFunc = submitFunc;
        dragFunc = submitFunc;
    };


    var editTextHtml = function(n, drawInfo, keyCallbacks, callbacks) {
        $('#editModal').modal('show');
    };

    var editUri = function(n, drawInfo, keyCallbacks, callbacks) {
        $('#editModal').modal('show');
    };

    var editImage = function(n, drawInfo, keyCallbacks, callbacks) {
        $('#editModal').modal('show');
    };

    var editAudio = function(n, drawInfo, keyCallbacks, callbacks) {
        $('#editModal').modal('show');
    };

    var dragEvent = function(x, y) {
        dragFunc(x, y);
    };

    var clickEvent = function(x, y) {
        clickFunc(x, y);
    }

    var editMode = {
        "text/plain" : editTextPlain,
        "text/html" : editTextHtml,
        "text/uri-list" : editUri,
        "image" : editImage,
        "audio" : editAudio,
        "drag" : dragEvent,
        "click" : clickEvent,
    };

    return editMode;
}
