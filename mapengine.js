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
        'cursorColor' : "#CCCCCC",
        'cursorMargin' : 2,
    };

    return {
        get: function(name) { return private[name]; },
        set: function(name, value) { private[name] = value; },
        toJSON: function() { return JSON.stringify(private); }
    }
};

function Node(parentsId) {
    // data
    this.mimetype = "plain/text";
    this.data = "default";
    this.font = {face : "Arial", size : 15, color : "#000000", bgColor : "#ffffff"};
    // link
    this.link = {left : [], right : [], parents : parentsId};
    // draw
    this.display = true;
    this.drawPos = {start:{x:0, y:0}, end:{x:0, y:0}};
    this.measure = {width:0, height:0};
    this.lHeight = 0;
    this.rHeight = 0;
    // not implement
    this.rechable = true;
    this.fold = false;
    this.offsetX = 0;
    this.offsetY = 0;
};

function Users(rootid) {
    var users = { "owner" : rootid, };
    var select = { "owner" : [], }
    return {
        get : function(uname) { return users[uname]; },
        getNameById : function(nid) {
            for(u in users) {
                if(users[u] == nid) return u;
            }
            return null;
        },
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
        getRootId : function(nid) {
            var node;
            while(true) {
                node = nodeDB[nid];
                if(node.link.parents == nid) {
                    return nid;
                }
                nid = node.link.parents;
            };

        },
        getIdByPoint : function(x, y) {
            var node;
            for(var i in nodeDB) {
                node = nodeDB[i];
                if(node.display
                    && node.drawPos.start.x <= x && x <= node.drawPos.end.x
                    && node.drawPos.start.y <= y && y <= node.drawPos.end.y) {
                    return Number(i);
                }
            }
            return null;
        },
        appendChild : function(parentsId) {
            nodeDB.push(new Node(parentsId));
            nodeDB[parentsId].link.right.push(nodeDB.length - 1);
            return nodeDB.length - 1;
        },
        clone : function(nid) {
            nodeDB.push(JSON.parse(JSON.stringify(nodeDB[nid])));
            return nodeDB.length - 1;
        },
        deepClone : function(nid) {
            nodeDB.push(JSON.parse(JSON.stringify(nodeDB[nid])));
            clondNodeId = nodeDB.length - 1;

            // right
            oldChilds = nodeDB[nid].link.right;
            nodeDB[clondNodeId].link.right = [];
            for(var child in oldChilds) {
                nodeDB[cloneNodeId].link.right.push(_deepClone(oldChilds[child]));
            }
            // left
            oldChilds = nodeDB[nid].link.left;
            nodeDB[clondNodeId].link.left = [];
            for(var child in oldChilds) {
                nodeDB[cloneNodeId].link.left.push(_deepClone(oldChilds[child]));
            }
            return cloneNodeId;
        },
        getParentsId : function(nid) { return nodeDB[nid].link.parents },
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
    var rootX = 0, rootY = 0;
    (function init() {
        db = new NodeDB();
        var nid = db.create(0);
        users = new Users(nid);
    })();

    var DIRECT = {ROOT:0, LEFT:1, RIGHT:2};

    drawSetup = function(ctx, node) {
        ctx.fillStyle = node.font.color;
        ctx.font = node.font.size + "px " + node.font.face;
    }

    getLeftChild = function(nid) {
        var child, node = db.get(nid);
        for(var i in node.link.left) {
            child = db.get(node.link.left[i]);
            if(child.display) {
                return node.link.left[i];
            }
        }
        return nid;
    }

    getRightChild = function(nid) {
        var child, node = db.get(nid);
        for(var i in node.link.right) {
            child = db.get(node.link.right[i]);
            if(child.display) {
                return node.link.right[i];
            }
        }
        return nid;
    }

    checkDirection = function(nodeid) {
        var rootid = db.getRootId(nodeid);
        var root = db.get(rootid);
        var node = db.get(nodeid);
        if(rootid == nodeid) {
            return DIRECT.ROOT;
        }
        if(root.drawPos.start.x > node.drawPos.start.x) {
            return DIRECT.LEFT;
        } else {
            return DIRECT.RIGHT;
        }
    }

    draw = function(ctx, node, nid, posX, posY) {
        // draw node
        if(!node.display) {
            return 0;
        }

        // draw uer cursor
        var uname = users.getNameById(nid);
        if(uname != null) {
            ctx.fillStyle = config.get("cursorColor");
        } else {
            ctx.fillStyle = node.font.bgColor;
        }
        margin = config.get("cursorMargin");
        ctx.fillRect(posX, posY - node.measure.height
                        , node.measure.width + margin
                        , node.measure.height + margin);

        // draw node
        drawSetup(ctx, node);
        ctx.fillText(node.data, posX, posY);

        // update node draw pos
        node.drawPos.start = {x : posX, y : posY - node.measure.height};
        node.drawPos.end = {x : posX + node.measure.width
                                , y : posY};

        // update point for draw right child
        posX = posX + node.measure.width;
        posY = posY - node.rHeight / 2;
        // draw
        var child = null;
        for(var i in node.link.right) {
            child = db.get(node.link.right[i]);
            if(child.display) {
                posY += draw(ctx, child, node.link.right[i]
                    , posX + marginNodeLeft, posY) + config.get("marginNodeTop");
            }
        }

        // update point for draw left child
        posX = posX + node.measure.width;
        posY = posY - node.lHeight / 2;
        // draw
        for(var i in node.link.left) {
            child = db.get(node.link.left[i]);
            if(child.display) {
                posY += draw(ctx, child, node.link.left[i]
                    , posX - marginNodeLeft, posY) + config.get("marginNodeTop");
            }
        }

        return Math.max(node.measure.height, node.lHeight, node.rHeight);
    };

    measure = function(ctx, nid) {
        // prepare
        var node = db.get(nid);
        if(!node.display) {
            return 0;
        }
        drawSetup(ctx, node);
        marginNodeTop = config.get("marginNodeTop");
        marginNodeLeft = config.get("marginNodeLeft");

        // measure setup
        node.measure.width = ctx.measureText(node.data).width;
        node.measure.height = node.font.size;

        // mesure right child size
        node.rHeight = 0;

        for(var i in node.link.right) {
            node.rHeight += measure(ctx, node.link.right[i]);
        }
        node.lHeight = 0;
        for(var i in node.link.left) {
            node.lHeight += measure(ctx, node.link.left[i]);
        }
        return Math.max(node.rHeight, node.lHeight, node.measure.height);
    };

    _draw = function(arg) {
        ctx = arg["ctx"];
        measure(ctx, 0);
        var node = db.get(0);
        var posX = arg["width"] / 2 - rootX - ctx.measureText(node.data).width / 2;
        var posY = arg["height"] / 2 - rootY;
        draw(ctx, node, 0, posX, posY);
    };

    _moveRoot = function(arg) {
        rootX += arg["x"];
        rootY += arg["y"];
    }

    _moveCursor = function(arg) {
        var nid = db.getIdByPoint(arg.x, arg.y);
        var oldNid = users.get("owner");
        if(nid != null && nid != oldNid) {
            users.update("owner", nid);
            return true;
        }
        return false;
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
        users.update(arg["uname"], parentsNodeId);
        db.hide(currentNodeId);
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
    _keyLeft = function() {
        var nid = users.get("owner");
        var direct = checkDirection(nid);
        if(direct == DIRECT.ROOT || direct == DIRECT.LEFT) {
            users.update("owner", getLeftChild(nid));
        } else if(direct == DIRECT.RIGHT) {
            users.update("owner", db.getParentsId(nid));
        }
    };
    _keyRight = function() {
        var nid = users.get("owner");
        var direct = checkDirection(nid);
        if(direct == DIRECT.ROOT || direct == DIRECT.RIGHT) {
            users.update("owner", getRightChild(nid));
        } else if(direct == DIRECT.LEFT) {
            users.update("owner", db.getParentsId(nid));
        }
    };
    _keyUp = function() {
    };
    _keyDown = function() {
    };
    _toJSON = function() { return JSON.stringify(db); };

    return {
        draw : _draw,
        moveRoot : _moveRoot,
        moveCursor : _moveCursor,
        edit : _edit,
        append : _append,
        remove : _hide,
        clone : _clone,
        undo : _undo,
        redo : _redo,
        toJSON : _toJSON,
        keyLeft : _keyLeft,
        keyRight : _keyRight,
        keyUp : _keyUp,
        keyDown : _keyDown,
    };
}