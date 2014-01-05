var node_plaintext = function() {
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

    return {
        draw : draw,
        measure : measure,
        fold : null,
        unfold : null,
        onCreate : null,
        onDelete : null,
        editHook : [],
        createHook : [],
        deleteHook : [],
    };
};
