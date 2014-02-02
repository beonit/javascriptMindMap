var node_texturi = function(container) {
    var _node, _ctx, _initWidth;
    var submitEdit, cancelEdit;
    var margin = gMapConfig.get("cursorMargin");
    var elementPrefix = "node_texturi_";
    var el;

    var input = document.createElement("input");
    input.style.position = "absolute";
    input.style.display = "none";
    container.appendChild(input);

    var createElementIfItNeed = function(n) {
        el = document.getElementById(elementPrefix + n.hash);
        if(el == null) {
            el = document.createElement("div");
            el.setAttribute("id", elementPrefix + n.hash);
            el.style.position = "absolute";
            el.style.display = "block";
            container.appendChild(el);
        }
        return el;
    };

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

    var draw = function(ctx, n, drawInfo, posX, posY) {
        el = createElementIfItNeed(n);
        el.innerText = n.data;
        el.style.left = posX + "px";
        el.style.top = (posY - drawInfo.measure.height) + "px";
        // ctx.fillStyle = n.font.color;
        // ctx.font = n.font.size + "px " + n.font.face;
        // ctx.fillText(n.data, posX, posY);
    };

    var measure = function(ctx, n) {
        el = createElementIfItNeed(n);
        el.innerText = n.data;
        return {
            width : el.offsetWidth,
            height : el.offsetHeight
        };
    };

    var startEdit = function(ctx, node, drawInfo, submit, cancel) {
        var el = createElementIfItNeed(node);
        el.style.display = "none";
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

    var finishEdit = function(oldNode, newNode) {
        input.style.display = "none";
        input.removeEventListener("keydown", keyListener, false);
        var el = createElementIfItNeed(oldNode);
        el.style.display = "none";
        el = createElementIfItNeed(newNode);
        el.innerText = newNode.data;
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

    var onHide = function(n) {
        var el = createElementIfItNeed(n);
        el.style.display = "none";
    };

    var onUnhide = function(n) {
        var el = createElementIfItNeed(n);
        el.style.display = "block";
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
        onHide : onHide,
        onUnhide : onUnhide,
    };
};
