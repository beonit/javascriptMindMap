function ArrayRemoveElement(a, from, to) {
    var rest = a.slice((to||from) + 1 || a.length);
    a.length = from < 0 ? a.length + from : from;
    return a.push.apply(a, rest);
};

function CreateMapConfig() {
    var private = {
        'backgroundColor' : "#FFFFFF",
        'marginNodeTop' : 10,
        'marginNodeLeft' : 30,
        'cursorColor' : "#CCCCCC",
        'cursorMargin' : 3,
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

    findUpperNidInList = function (nid, list) {
        var i = list.indexOf(nid);
        while(--i >= 0 && !nodeDB[list[i]].display);
        return list[i];
    };

    findLowerNidInList = function(nid, list) {
        var i = list.indexOf(nid);
        while(i >= 0 && ++i < list.length && !nodeDB[list[i]].display);
        return list[i];
    };

    _getChildListHasNid = function(nid) {
        var parents = nodeDB[nodeDB[nid].link.parents];
        if(parents.link.left.indexOf(nid) >= 0) {
            return parents.link.left;
        } else if(parents.link.right.indexOf(nid) >= 0) {
            return parents.link.right;
        }
    };

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
        findUpperSibling : function(nid) {
            return findUpperNidInList(nid, _getChildListHasNid(nid));
        },
        findLowerSibling : function(nid) {
            return findLowerNidInList(nid, _getChildListHasNid(nid));
        },
        swapOrder : function(nid1, nid2) {
            var list = _getChildListHasNid(nid1);
            var i1 = list.indexOf(nid1);
            var i2 = list.indexOf(nid2);
            var temp = list[i1];
            list[i1] = list[i2];
            list[i2] = temp;
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
    var users, db, undoList = [], currentUndoIndex = 0, painter;
    (function init() {
        db = new NodeDB();
        var nid = db.create(0);
        users = new Users(nid);
        painter = new Painter(db, users, config);
    })();

    var DIRECT = {ROOT:0, LEFT:1, RIGHT:2};

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

    _keyUp = function(canvasHeight) {
        var nid = users.get("owner");
        if(checkDirection(nid) == DIRECT.ROOT) {
            return;
        }
        // find sibling
        var sibling = db.findUpperSibling(nid);
        if(sibling) {
            users.update("owner", sibling);
            return;
        }
        // find by point
        var node = db.get(nid);
        var posY, posX;
        var marginNodeTop = config.get("marginNodeTop");
        posX = node.drawPos.start.x;
        posY = node.drawPos.start.y - marginNodeTop;
        for(; posY > 0; posY -= marginNodeTop) {
            nid = db.getIdByPoint(posX, posY);
            if(nid != null) {
                users.update("owner", nid);
                break;
            }
        }
        // no node...
    };
    _keyDown = function(canvasHeight) {
        var nid = users.get("owner");
        if(checkDirection(nid) == DIRECT.ROOT) {
            return;
        }
        // find sibling
        var sibling = db.findLowerSibling(nid);
        if(sibling) {
            users.update("owner", sibling);
            return;
        }
        // find by point
        var node = db.get(nid);
        var posY, posX;
        var marginNodeTop = config.get("marginNodeTop");
        posX = node.drawPos.start.x;
        posY = node.drawPos.end.y + marginNodeTop;
        for(; posY < canvasHeight; posY += marginNodeTop) {
            nid = db.getIdByPoint(posX, posY);
            if(nid != null) {
                users.update("owner", nid);
                break;
            }
        }
        // no node...
    };
    _orderUp = function() {
        var nid = users.get("owner");
        var siblingid = db.findUpperSibling(nid);
        if(!siblingid) {
            return;
        }
        db.swapOrder(nid, siblingid);
        appendUndo(function() {
                db.swapOrder(nid, siblingid);
            }, function() {
                db.swapOrder(nid, siblingid);
            });
    };
    _orderDown = function() {
        var nid = users.get("owner");
        var siblingid = db.findLowerSibling(nid);
        if(!siblingid) {
            return;
        }
        db.swapOrder(nid, siblingid);
        appendUndo(function() {
                db.swapOrder(nid, siblingid);
            }, function() {
                db.swapOrder(nid, siblingid);
            });
    };
    _toJSON = function() { return JSON.stringify(db); };

    return {
        draw : painter.drawTree,
        moveRoot : painter.moveRoot,
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
        orderUp : _orderUp,
        orderDown : _orderDown,
    };
}

function Painter(db, users, config) {

    var rootX = 0, rootY = 0;

    _moveRoot = function(arg) {
        rootX += arg["x"];
        rootY += arg["y"];
    }

    _drawNodeAndChilds = function(arg) {
        var ctx = arg["ctx"];
        var node = db.get(0);
        var nid = 0;
        var width = arg["width"];
        var height = arg["height"];

        measureTree(ctx, 0);
        var posX = width / 2 - rootX - ctx.measureText(node.data).width / 2;
        var posY = height / 2 - rootY;
        drawNodeTree(ctx, node, nid, posX, posY);
    }

    drawSetup = function(ctx, node) {
        ctx.fillStyle = node.font.color;
        ctx.font = node.font.size + "px " + node.font.face;
    }

    drawNode = function(ctx, node, nid, posX, posY) {
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
        node.drawPos.end = {x : posX + node.measure.width, y : posY};
    }

    drawNodeTree = function(ctx, node, nid, posX, posY) {
        // draw node
        if(!node.display) {
            return 0;
        }
        var orgPosX = posX, orgPosY = posY;
        var marginNodeTop = config.get("marginNodeTop");

        // drawNode
        drawNode(ctx, node, nid, orgPosX, orgPosY);

        // update point for draw right child
        posX = orgPosX + node.measure.width + config.get("marginNodeTop");
        if(node.measure.height < node.rHeight) {
            posY = orgPosY - node.rHeight / 2;
        } else {
            posY = orgPosY - node.rHeight;
        }
        var child = null, childId;
        for(var i in node.link.right) {
            childId = node.link.right[i];
            child = db.get(childId);
            if(child.display) {
                if(node.measure.height < node.rHeight) {
                    drawNodeTree(ctx, child, childId, posX, posY + child.rHeight / 2);
                } else {
                    drawNodeTree(ctx, child, childId, posX, posY + child.rHeight);
                }
                posY += child.rHeight + marginNodeTop;
            }
        }

        // update point for draw left child
        return Math.max(node.measure.height, node.lHeight, node.rHeight);
    };

    measureTree = function(ctx, nid) {
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
            if(db.get(node.link.right[i]).display) {
                if(node.rHeight != 0) {
                    node.rHeight += marginNodeTop;
                }
                node.rHeight += measureTree(ctx, node.link.right[i]);
            }
        }
        node.rHeight = Math.max(node.rHeight, node.measure.height);

        node.lHeight = 0;
        for(var i in node.link.left) {
            if(db.get(node.link.left[i]).display) {
                if(node.lHeight != 0) {
                    node.lHeight += marginNodeTop;
                }
                node.lHeight += measureTree(ctx, node.link.left[i]);
            }
        }
        node.lHeight = Math.max(node.lHeight, node.measure.height);

        return Math.max(node.rHeight, node.lHeight);
    };

    return {
        moveRoot : _moveRoot,
        drawTree : _drawNodeAndChilds,
    }
}