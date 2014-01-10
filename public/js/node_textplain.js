var node_plaintext = function(container) {
    var _node, _ctx, _initWidth;
    var submitEdit, cancelEdit;
    var margin = gMapConfig.get("cursorMargin");

    var input = document.createElement("input");
    input.style.position = "absolute";
    input.style.display = "none";
    container.appendChild(input);

    var drawCursor = function(ctx, n, drawInfo, posX, posY) {
        ctx.fillStyle = gMapConfig.get("cursorColor");
        drawBgCommon(ctx, n, drawInfo, posX, posY);
    };

    var drawBackround = function(ctx, n, drawInfo, posX, posY) {
        ctx.fillStyle = n.font.bgColor;
        drawBgCommon(ctx, n, drawInfo, posX, posY);
    };

    var drawBgCommon = function(ctx, n, drawInfo, posX, posY) {
        ctx.fillRect(posX, posY - drawInfo.measure.height,
                     drawInfo.measure.width + margin,
                     drawInfo.measure.height + margin);
    }

    var draw = function(ctx, n, posX, posY) {
        ctx.fillStyle = n.font.color;
        ctx.font = n.font.size + "px " + n.font.face;
        ctx.fillText(n.data, posX, posY);
    };

    var measure = function(ctx, n) {
        ctx.fillStyle = n.font.color;
        ctx.font = n.font.size + "px " + n.font.face;
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
        drawCursor : drawCursor,
        drawBackround : drawBackround,
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
