function Painter(db, users, nodeFuncs) {
    var canvasX = 0, canvasY = 0;
    var ctx;

    var moveCanvas = function(arg) {
        canvasX += arg["x"];
        canvasY += arg["y"];
    }

    var drawNodeAndChilds = function(arg) {
        var rootId = arg["root"];
        var node = db.get(rootId);
        if(node.display) {
            ctx = arg["ctx"];
            var nid = rootId;
            var width = arg["width"];
            var height = arg["height"];

            measureTree(ctx, rootId);
            var posX = width / 2 - canvasX -
                ctx.measureText(node.data).width / 2;
            var posY = height / 2 - canvasY;
            drawNodeTree(ctx, node, nid, posX, posY);
        }
    }

    var drawNode = function(ctx, node, nid, posX, posY) {
        var drawInfo = db.getDrawInfo(nid);
        var uname = users.getNameById(nid);
        if(uname != null) {
            nodeFuncs[node.mimetype].drawCursor(ctx, node,
                                                drawInfo, posX, posY);
        } else {
            nodeFuncs[node.mimetype].drawBackround(ctx, node,
                                                   drawInfo, posX, posY);
        }

        // draw node
        nodeFuncs[node.mimetype].draw(ctx, node, drawInfo, posX, posY);

        // draw under line
        ctx.beginPath();
        ctx.fillStyle = node.edge.color;
        ctx.lineWidth = node.edge.thick;
        ctx.lineWith = 1;
        ctx.moveTo(posX, posY + 2);
        var margin = gMapConfig.get("cursorMargin");
        ctx.lineTo(posX + drawInfo.measure.width + margin, posY + 2);
        ctx.stroke();
        ctx.closePath();

        // fold mark
        if(node.fold) {
            ctx.beginPath();
            var posXOffset = 0;
            if(node.link.left.length > 0) {
                posXOffset = -2;
            } else if(node.link.right.length > 0) {
                posXOffset = drawInfo.measure.width + 4;
            }
            ctx.arc(posX + posXOffset, posY + 2, 2, 0, 2 * Math.PI, false);
            ctx.fillStyle = 'black';
            ctx.fill();
            ctx.stroke();
            ctx.closePath();
        }

        // update node draw pos
        drawInfo.drawPos.start = {x : posX, y : posY - drawInfo.measure.height};
        drawInfo.drawPos.end = {x : posX + drawInfo.measure.width, y : posY};
    };

    var drawLeftEdge = function(ctx, node, fromX, fromY, toX, toY) {
        ctx.beginPath();
        ctx.fillStyle = node.edge.color;
        ctx.lineWidth = node.edge.thick;
        var EdgeBezier = gMapConfig.get("marginNodeLeft") / 2;
        ctx.moveTo(fromX, fromY + 2);
        ctx.bezierCurveTo(fromX - EdgeBezier, fromY + 2, toX + EdgeBezier,
                          toY + 2, toX, toY + 2);
        ctx.stroke();
        ctx.closePath();
    };

    var drawRightEdge = function(ctx, node, fromX, fromY, toX, toY) {
        ctx.beginPath();
        ctx.fillStyle = node.edge.color;
        ctx.lineWidth = node.edge.thick;
        var EdgeBezier = gMapConfig.get("marginNodeLeft") / 2;
        ctx.moveTo(fromX, fromY + 2);
        ctx.bezierCurveTo(fromX + EdgeBezier, fromY + 2, toX - EdgeBezier,
                          toY + 2, toX, toY + 2);
        ctx.stroke();
        ctx.closePath();
    };

    var drawLeftChilds = function(ctx, node, nid, posX, posY) {
        var fromX = posX;
        var fromY = posY;
        var marginNodeLeft = gMapConfig.get("marginNodeLeft");
        var marginNodeTop = gMapConfig.get("marginNodeTop");
        var drawInfo = db.getDrawInfo(nid);
        if(drawInfo.measure.height < drawInfo.lHeight) {
            posY = posY - drawInfo.lHeight / 2;
        } else {
            posY = posY - drawInfo.lHeight;
        }
        var child = null, childId;
        for(var i in node.link.left) {
            childId = node.link.left[i];
            child = db.get(childId);
            var childDrawInfo = db.getDrawInfo(childId);
            if(child.display) {
                if(drawInfo.measure.height < drawInfo.lHeight) {
                    drawLeftEdge(ctx, child, fromX, fromY,
                                 fromX - marginNodeLeft,
                                 posY + childDrawInfo.lHeight / 2);
                    drawNodeTree(ctx, child, childId,
                                 fromX - childDrawInfo.measure.width - marginNodeLeft,
                                 posY + childDrawInfo.lHeight / 2);
                } else {
                    drawLeftEdge(ctx, child, fromX, fromY,
                                 fromX - marginNodeLeft,
                                 posY + childDrawInfo.lHeight);
                    drawNodeTree(ctx, child, childId,
                                 fromX - childDrawInfo.measure.width - marginNodeLeft,
                                 posY + childDrawInfo.lHeight);
                }
                posY += childDrawInfo.lHeight + marginNodeTop;
            }
        }
    };

    var drawRightChilds = function(ctx, node, nid, posX, posY) {
        var drawInfo = db.getDrawInfo(nid);
        var fromX = posX + drawInfo.measure.width;
        var fromY = posY;
        posX = posX + drawInfo.measure.width + gMapConfig.get("marginNodeLeft");
        if(drawInfo.measure.height < drawInfo.rHeight) {
            posY = posY - drawInfo.rHeight / 2;
        } else {
            posY = posY - drawInfo.rHeight;
        }
        var child = null, childId;
        for(var i in node.link.right) {
            childId = node.link.right[i];
            child = db.get(childId);
            var childDrawInfo = db.getDrawInfo(childId);
            if(child.display) {
                if(drawInfo.measure.height < drawInfo.rHeight) {
                    drawRightEdge(ctx, child, fromX + 2, fromY,
                                  posX, posY + childDrawInfo.rHeight / 2);
                    drawNodeTree(ctx, child, childId, posX,
                                 posY + childDrawInfo.rHeight / 2);
                } else {
                    drawRightEdge(ctx, child, fromX + 2, fromY,
                                  posX, posY + childDrawInfo.rHeight);
                    drawNodeTree(ctx, child, childId, posX,
                                 posY + childDrawInfo.rHeight);
                }
                posY += childDrawInfo.rHeight + marginNodeTop;
            }
        }
    };

    var drawNodeTree = function(ctx, node, nid, posX, posY) {
        if(!node.display) {
            return 0;
        }
        drawNode(ctx, node, nid, posX, posY);
        if(!node.fold && node.link.left.length > 0) {
            drawLeftChilds(ctx, node, nid, posX, posY);
        }
        if(!node.fold && node.link.right.length > 0) {
            drawRightChilds(ctx, node, nid, posX, posY);
        }
        return;
    };

    var measureWidth = function(n) {
        return measureFuncs[n.mimetype](n).width;
    };

    var measureTree = function(ctx, nid) {
        // prepare
        var node = db.get(nid);
        if(!node.display) {
            return 0;
        }
        var drawInfo = db.getDrawInfo(nid);
        marginNodeTop = gMapConfig.get("marginNodeTop");
        marginNodeLeft = gMapConfig.get("marginNodeLeft");

        // measure setup
        drawInfo.measure = nodeFuncs[node.mimetype].measure(ctx, node);

        // measure right child size
        drawInfo.rHeight = 0;
        if(!node.fold) {
            for(var i in node.link.right) {
                if(db.get(node.link.right[i]).display) {
                    if(drawInfo.rHeight != 0) {
                        drawInfo.rHeight += marginNodeTop;
                    }
                    drawInfo.rHeight += measureTree(ctx, node.link.right[i]);
                }
            }
        }
        drawInfo.rHeight = Math.max(drawInfo.rHeight, drawInfo.measure.height);

        drawInfo.lHeight = 0;
        if(!node.fold) {
            for(var i in node.link.left) {
                if(db.get(node.link.left[i]).display) {
                    if(drawInfo.lHeight != 0) {
                        drawInfo.lHeight += marginNodeTop;
                    }
                    drawInfo.lHeight += measureTree(ctx, node.link.left[i]);
                }
            }
        }
        drawInfo.lHeight = Math.max(drawInfo.lHeight, drawInfo.measure.height);

        return Math.max(drawInfo.rHeight, drawInfo.lHeight);
    };

    var painterAPIs = {
        moveCanvas : moveCanvas,
        drawTree : drawNodeAndChilds,
        measureWidth : measureWidth,
    };
    return painterAPIs;
}
