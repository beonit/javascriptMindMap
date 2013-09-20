function ArrayRemoveElement(a, from, to) {
    var rest = a.slice((to||from) + 1 || a.length);
    a.length = from < 0 ? a.length + from : from;
    return a.push.apply(a, rest);
};

function CreateMapConfig() {
    var private = {
        'backgroundColor' : "#FFFFFF",
        'marginNodeTop' : 5,
        'marginNodeLeft' : 30,
    };

    return {
        get: function(name) { return private[name]; },
        set: function(name, value) { private[name] = value; },
        toJSON: function() { return JSON.stringify(private); }
    }
};

function Node(parentsId) {
    this.mimetype = "plain/text";
    this.data = "default";
    this.fontFace = "Arial";
    this.fontSize = "15px";
    this.fontColor = "#000000";
    this.childs = [];
    this.parents = parentsId;
    this.rechable = true;
    this.display = true;
    this.fold = false;
    this.width = 0;
    this.height = 0;
    this.offsetX = 0;
    this.offsetY = 0;
    this.drawPosStart = {x:0, y:0};
    this.drawPosEnd = {x:0, y:0};
}

function Users(rootid) {
    var users = { "owner" : rootid, };
    var select = { "owner" : [], }
    return {
        get : function(uname) { return users[uname]; },
        update : function(uname, nid) { users[uname] = nid; },
        remove : function(uname) { users.pop(uname); },
        toJSON : function() { return JSON.stringify(users); }
    }
}

function NodeDB() {
    var nodeDB = [];
    return {
        create : function(parentsId) {
            nodeDB.push(new Node(parentsId));
            return nodeDB.length - 1;
        },
        get : function(nid) {
            return nodeDB[nid];
        },
        appendChild : function(parentsId) {
            nodeDB.push(new Node(parentsId));
            nodeDB[parentsId].childs.push(nodeDB.length - 1);
            return nodeDB.length - 1;
        },
        clone : function(nid) {
            nodeDB.push(JSON.parse(JSON.stringify(nodeDB[nid])));
            return nodeDB.length - 1;
        },
        deepClone : function(nid) {
            oldChilds = nodeDB[nid].childs;
            nodeDB.push(JSON.parse(JSON.stringify(nodeDB[nid])));
            clondNodeId = nodeDB.length - 1;
            nodeDB[clondNodeId].childs = [];
            for(var child in oldchilds) {
                nodeDB[cloneNodeId].childs.push(_deepClone(oldchilds[child]));
            }
            return cloneNodeId;
        },
        getParentsId : function(nid) { return nodeDB[nid].parentsNodeId },
        replace : function(nid, node) { nodeDB[nid] = node; },
        hide : function(nid) { nodeDB[nid].display = false; },
        show : function(nid) { nodeDB[nid].display = true; },
        gc: function(nid) {
            /*
            TODO : find nodes that unreachable from nid and
            display false
             */
         },
        toJSON : function() { return JSON.stringify(nodeDB); }
    }
}

function Map(config) {
    var users, db, undoList = [], currentUndoIndex = 0;
    (function init() {
        db = new NodeDB();
        nid = db.create(0);
        users = new Users(nid);
    })();

    drawSetup = function(ctx, node) {
        ctx.fillStyle = node.fontColor;
        ctx.font = node.fontSize + " " + node.fontFace;
    }

    drawRight = function(ctx, node, posX, posY) {
        // draw node
        if(!node.display) {
            return 0;
        }
        drawSetup(ctx, node);
        measureWidth = ctx.measureText(node.data).width;
        ctx.fillText(node.data, posX, posY);

        // update draw pos
        node.drawPosStart = {x:posX, y:posY};
        node.drawPosEnd = {x:posX + measureWidth, y:posY + node.fontSize};

        // update point for draw right child
        posX = posX + measureWidth + config.get("marginNodeLeft");
        posY = posY - node.height / 2;
        // draw child
        for(var i in node.childs) {
            child = db.get(node.childs[i]);
            if(child.display) {
                posY += drawRight(ctx, child, posX, posY);
            }
        }
        return node.height;
    }

    _draw = function(arg) {
        ctx = arg["ctx"];
        measure(ctx, 0);
        node = db.get(0);
        posX = arg["x"] - ctx.measureText(node.data).width / 2;
        posY = arg["y"];
        drawRight(ctx, node, posX, posY);
    };

    measure = function(ctx, nid) {
        node = db.get(nid);
        if(!node.display) {
            return 0;
        }
        marginNodeTop = config.get("marginNodeTop");
        marginNodeLeft = config.get("marginNodeLeft");
        ctx.font = node.fontFace + node.fontSize;
        node.width = ctx.measureText(node.data) + marginNodeLeft;
        node.height = 0;
        childWidthMax = 0;
        for(var child in node.childs) {
            rst = measure(ctx, node.childs[child]) + marginNodeTop;
            node.height += rst.height;
            childWidthMax = childWidthMax > rst.width
                                ? childWidthMax : rst.width;
        }
        node.height = node.height < node.fontSize
                        ? node.fontSize + marginNodeTop
                        : node.height;
        node.width += childWidthMax;
        return {height:node.height, width:node.width};
    }

    _append = function(arg) {
        var currentNodeId = users.get(arg["uname"]);
        var newNodeId = db.appendChild(currentNodeId);
        users.update(arg["uname"], newNodeId);
        appendUndo(function() {
                db.hide(newNodeId);
                users.update(arg["uname"], currentNodeId);
            } , function() {
                db.show(newNodeId);
                users.update(arg["uname"], newNodeId);
            });
    };
    _hide = function(arg) {
        var currentNodeId = users.get(arg["uname"]);
        var parentsNodeId = db.getParentsId(currentNodeId);
        db.hide(currentNodeId);
        users.update(arg["uname"], parentsNodeId);
        appendUndo(function() {
                db.show(currentNodeId);
                users.update(arg["uname"], currentNodeId);
            }, function() {
                db.hide(currentNodeId);
                users.update(arg["uname"], parentsNodeId);
            });
    };
    _undo = function() { undoList[--currentUndoIndex].undo(); };
    _redo = function() { undoList[currentUndoIndex++].redo(); };
    appendUndo = function(undoFunc, redoFunc) {
        ArrayRemoveElement(undoList, currentUndoIndex, undoList.length - 1);
        undoList.push({undo : undoFunc, redo : redoFunc});
        currentUndoIndex++;
    };
    _clone = function() {};
    _edit = function() {

    };
    _toJSON = function() { return JSON.stringify(db); };

    return {
        draw : _draw,
        edit : _edit,
        append : _append,
        remove : _hide,
        clone : _clone,
        undo : _undo,
        redo : _redo,
        toJSON : _toJSON,
    };
}