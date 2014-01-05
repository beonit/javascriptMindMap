var node_plaintext = function(container) {
    var _node, _ctx, _initWidth;
    var submitEdit, cancelEdit;

    var input = document.createElement("input");
    input.style.position = "absolute";
    input.style.display = "none";
    container.appendChild(input);

    var draw = function(ctx, n, posX, posY) {
        ctx.fillText(n.data, posX, posY);
    };

    var measure = function(ctx, n) {
        return {
            width : ctx.measureText(n.data).width
                + gMapConfig.get("cursorMargin"),
            height : n.font.size
        };
    };

    var startEdit = function(ctx, node, drawInfo, submit, cancel) {
        _node = node;
        _ctx = ctx;
        _initWidth = drawInfo.measure.width;
        submitEdit = submit;
        cancelEdit = cancel;

        input.style.left = drawInfo.drawPos.start.x + "px";
        input.style.top = drawInfo.drawPos.start.y + "px";
        input.style.width = drawInfo.measure.width + 10 + "px";
        input.value = _node.data;
        input.style.display = "block";
        input.focus();
        input.select();
        input.addEventListener("keydown", keyListener, false);
    };

    var finishEdit = function() {
        input.style.display = "none";
        input.removeEventListener("keydown", keyListener, false);
    };

    var keyListener = function(e) {
        _node.data = input.value;
        if(e.keyCode == 13) { // ENTER
            submitEdit();
        } else if(e.keyCode == 27) { // ESC
            cancelEdit();
        }
        var newWidth = measure(_ctx, _node).width;
        input.style.width = Math.max(newWidth, _initWidth) + 10 + "px";
        e.stopPropagation();
    };

    return {
        draw : draw,
        measure : measure,
        startEdit : startEdit,
        finishEdit : finishEdit,
        submitEdit : function() { submitEdit(); },
        cancelEdit : function() { cancelEdit(); },
        fold : null,
        unfold : null,
        onCreate : null,
        onDelete : null,
    };
};
