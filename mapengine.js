var DIRECT = {ROOT:0, LEFT:1, RIGHT:2};

function ArrayRemoveElement(a, from, to) {
    var rest = a.slice((to||from) + 1 || a.length);
    a.length = from < 0 ? a.length + from : from;
    return a.push.apply(a, rest);
};

function ArrayPushFirst(l, e) {
    l.reverse();
    l.push(e);
    l.reverse();
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
    var nodeDB = [], clipboard = [];

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

    getChildListHasNid = function(nid) {
        var parents = nodeDB[nodeDB[nid].link.parents];
        if(parents.link.left.indexOf(nid) >= 0) {
            return parents.link.left;
        } else if(parents.link.right.indexOf(nid) >= 0) {
            return parents.link.right;
        }
    };

    var _getRootId = function(nid) {
        while(nodeDB[nid].link.parents != nid) {
            nid = nodeDB[nid].link.parents;
        };
        return nid;
    };

    var _swapChildDirection = function(nid) {
        var t = nodeDB[nid].link.right;
        nodeDB[nid].link.right = nodeDB[nid].link.left;
        nodeDB[nid].link.left = t;
        for(var i in nodeDB[nid].link.right) {
            _swapChildDirection(nodeDB[nid].link.right[i]);
        }
        for(var i in nodeDB[nid].link.left) {
            _swapChildDirection(nodeDB[nid].link.left[i]);
        }
    };

    var _checkDirection = function(nid) {
        if(nodeDB[nid].link.parents == nid) {
            return DIRECT.ROOT;
        }
        var rootid = _getRootId(nid);
        while(nodeDB[nid].link.parents != rootid) {
            nid = nodeDB[nid].link.parents;
        }
        if(nodeDB[rootid].link.right.indexOf(nid) >= 0) {
            return DIRECT.RIGHT;
        } else {
            return DIRECT.LEFT;
        }
    };

    var _copyToClipboard = function(nid) {
        if(!nodeDB[nid].display)
            return;
        clipboard.push(JSON.parse(JSON.stringify(nodeDB[nid])));
        var index = clipboard.length - 1;
        clipboard[index].link.right = [];
        clipboard[index].link.left = [];

        var newChildIndex;
        for(var childIndex in nodeDB[nid].link.right) {
            newChildIndex = _copyToClipboard(nodeDB[nid].link.right[childIndex]);
            clipboard[index].link.right.push(newChildIndex);
        }
        var newChildIndex;
        for(var childIndex in nodeDB[nid].link.left) {
            newChildIndex = _copyToClipboard(nodeDB[nid].link.left[childIndex]);
            clipboard[index].link.right.push(newChildIndex);
        }
        return index;
    };

    var _pastFromClipboard = function(clipId, pid, direct) {
        var newNode = JSON.parse(JSON.stringify(clipboard[clipId]));
        newNode.link.parents = pid;
        newNode.link.left = [];
        newNode.link.right = [];
        var newNodeId = _appendChild(pid, newNode);

        var childList = clipboard[clipId].link.right;
        for(var childIndex in childList) {
            _pastFromClipboard(childList[childIndex], newNodeId, direct);
        }
        return newNodeId;
    };
    var _appendChild = function(parentsId, newNode) {
        nodeDB.push(newNode);
        var direct = _checkDirection(parentsId);
        if(direct == DIRECT.RIGHT) {
            nodeDB[parentsId].link.right.push(nodeDB.length - 1);
        } else if(direct == DIRECT.LEFT) {
            nodeDB[parentsId].link.left.push(nodeDB.length - 1);
        } else if(direct == DIRECT.ROOT) {
            var leftList = nodeDB[parentsId].link.left;
            var rightList = nodeDB[parentsId].link.right;
            if(_getChildListSize(rightList) <= _getChildListSize(leftList)) {
                rightList.push(nodeDB.length - 1);
            } else {
                leftList.push(nodeDB.length - 1);
            }
        }
        return nodeDB.length - 1;
    };

    var _getChildListSize = function(childList) {
        var size = 0;
        for(var i in childList) {
            if(nodeDB[childList[i]].display) {
                size++;
            }
        }
        return size;
    };

    return {
        create : function(parentsId) {
            nodeDB.push(new Node(parentsId));
            return nodeDB.length - 1;
        },
        get : function(nid) {
            return nodeDB[nid];
        },
        getRootId : _getRootId,
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
        appendChild : _appendChild,
        clone : function(nid) {
            nodeDB.push(JSON.parse(JSON.stringify(nodeDB[nid])));
            return nodeDB.length - 1;
        },
        checkDirection : _checkDirection,
        copyToClipboard : function(nid) {
            clipboard = [];
            _copyToClipboard(nid);
        },
        pasteFromClipboard : function(nid) {
            if(clipboard.length <= 0) {
                return nid;
            }
            var newChild = _pastFromClipboard(0, nid, _checkDirection(nid));
            return newChild;
        },
        findUpperSibling : function(nid) {
            return findUpperNidInList(nid, getChildListHasNid(nid));
        },
        findLowerSibling : function(nid) {
            return findLowerNidInList(nid, getChildListHasNid(nid));
        },
        swapOrder : function(nid1, nid2) {
            var list = getChildListHasNid(nid1);
            var i1 = list.indexOf(nid1);
            var i2 = list.indexOf(nid2);
            var temp = list[i1];
            list[i1] = list[i2];
            list[i2] = temp;
        },
        moveToLeftNode : function(pid, nid) {
            var rightList = nodeDB[pid].link.right;
            var nidIndex = rightList.indexOf(nid);
            ArrayRemoveElement(rightList, nidIndex, nidIndex);
            nodeDB[pid].link.left.splice(0, 0, nid);
            _swapChildDirection(nid);
        },
        moveToRightNode : function(pid, nid) {
            var leftList = nodeDB[pid].link.left;
            var nidIndex = leftList.indexOf(nid);
            ArrayRemoveElement(leftList, nidIndex, nidIndex);
            nodeDB[pid].link.right.push(nid);
            _swapChildDirection(nid);
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
    var clipBoard = false;
    (function init() {
        db = new NodeDB();
        var nid = db.create(0);
        users = new Users(nid);
        painter = new Painter(db, users, config);
    })();



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
        var newNode = new Node(currentNodeId);
        var newNodeId = db.appendChild(currentNodeId, newNode);
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
        var direct = db.checkDirection(nid);
        if(direct == DIRECT.ROOT || direct == DIRECT.LEFT) {
            users.update("owner", getLeftChild(nid));
        } else if(direct == DIRECT.RIGHT) {
            users.update("owner", db.getParentsId(nid));
        }
    };
    _keyRight = function() {
        var nid = users.get("owner");
        var direct = db.checkDirection(nid);
        if(direct == DIRECT.ROOT || direct == DIRECT.RIGHT) {
            users.update("owner", getRightChild(nid));
        } else if(direct == DIRECT.LEFT) {
            users.update("owner", db.getParentsId(nid));
        }
    };

    _keyUp = function(canvasHeight) {
        var nid = users.get("owner");
        if(db.checkDirection(nid) == DIRECT.ROOT) {
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
        if(db.checkDirection(nid) == DIRECT.ROOT) {
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
        if(siblingid) {
            db.swapOrder(nid, siblingid);
            appendUndo(function() {
                    db.swapOrder(nid, siblingid);
                }, function() {
                    db.swapOrder(nid, siblingid);
                });
        } else if(!siblingid && DIRECT.LEFT == db.checkDirection(nid)) {
            var parentsId = db.getParentsId(nid);
            var rootId = db.getRootId(nid);
            if(parentsId == rootId) {
                db.moveToRightNode(parentsId, nid);
                appendUndo(function() {
                        db.moveToLeftNode(parentsId, nid);
                    }, function() {
                        db.moveToRightNode(parentsId, nid);
                    });
            }
        }
    };
    _orderDown = function() {
        var nid = users.get("owner");
        var siblingid = db.findLowerSibling(nid);
        if(siblingid) {
            db.swapOrder(nid, siblingid);
            appendUndo(function() {
                    db.swapOrder(nid, siblingid);
                }, function() {
                    db.swapOrder(nid, siblingid);
                });
        } else if(!siblingid && DIRECT.RIGHT == db.checkDirection(nid)) {
            var parentsId = db.getParentsId(nid);
            var rootId = db.getRootId(nid);
            if(parentsId == rootId) {
                db.moveToLeftNode(parentsId, nid);
                appendUndo(function() {
                        db.moveToRightNode(parentsId, nid);
                    }, function() {
                        db.moveToLeftNode(parentsId, nid);
                    });
            }
        }
    };

    var _copy = function() {
        var nid = users.get("owner");
        db.copyToClipboard(nid);
    };

    var _cut = function() {
        var nid = users.get("owner");
        db.copyToClipboard(nid);
        _hide({"uname":"owner"});
    };

    var _paste = function() {
        var nid = users.get("owner");
        nid = db.pasteFromClipboard(nid);
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
        copy : _copy,
        paste : _paste,
        cut : _cut,
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
    };

    drawLeftChilds = function(ctx, node, nid, posX, posY) {
        var marginNodeTop = config.get("marginNodeTop");
        posX = posX - node.measure.width - marginNodeTop;
        if(node.measure.height < node.lHeight) {
            posY = posY - node.lHeight / 2;
        } else {
            posY = posY - node.lHeight;
        }
        var child = null, childId;
        for(var i in node.link.left) {
            childId = node.link.left[i];
            child = db.get(childId);
            if(child.display) {
                if(node.measure.height < node.lHeight) {
                    drawNodeTree(ctx, child, childId, posX, posY + child.lHeight / 2);
                } else {
                    drawNodeTree(ctx, child, childId, posX, posY + child.lHeight);
                }
                posY += child.lHeight + marginNodeTop;
            }
        }
    };

    drawRightChilds = function(ctx, node, nid, posX, posY) {
        posX = posX + node.measure.width + config.get("marginNodeTop");
        if(node.measure.height < node.rHeight) {
            posY = posY - node.rHeight / 2;
        } else {
            posY = posY - node.rHeight;
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
    };

    drawNodeTree = function(ctx, node, nid, posX, posY) {
        if(!node.display) {
            return 0;
        }
        drawNode(ctx, node, nid, posX, posY);
        if(node.link.left.length > 0) {
            drawLeftChilds(ctx, node, nid, posX, posY);
        }
        if(node.link.right.length > 0) {
            drawRightChilds(ctx, node, nid, posX, posY);
        }
        return;
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