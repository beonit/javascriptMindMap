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
        'marginNodeTop' : 15,
        'marginNodeLeft' : 40,
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
    this.mimetype = "text/plain";
    this.data = "default";
    this.font = { face : "Arial",
                  size : 15,
                  color : "#000000",
                  bgColor : "#ffffff",
                  edgeColog : "#000000",
                  edgeThick : 1 };
    // link
    this.link = { left : [], right : [], parents : parentsId };
    this.lastVisit = { left : null, right : null };
    // draw
    this.display = true;
    this.fold = false;
    // not implement yet
    // this.offsetX = 0;
    // this.offsetY = 0;
};

function DrawInfo() {
    this.drawPos = {start:{x:0, y:0}, end:{x:0, y:0}};
    this.measure = {width:0, height:0};
    this.lHeight = 0;
    this.rHeight = 0;
}

function Users(rootid, db) {
    var users = { "owner" : rootid, };
    var select = { "owner" : [], };
    return {
        get : function(uname) { return users[uname]; },
        getNameById : function(nid) {
            for(u in users) {
                if(users[u] == nid) return u;
            }
            return null;
        },
        update : function(uname, nid) {
            db.updateLastVisit(nid);
            users[uname] = nid;
        },
        remove : function(uname) { users.pop(uname); },
    }
}

function NodeDB() {
    var nodeDB = [], clipboard = [], roots = [], drawInfoDB = [];

    var _findUpperNidInList = function (nid, list) {
        var i = list.indexOf(nid);
        while(--i >= 0 && !nodeDB[list[i]].display);
        return list[i];
    };

    var _findLowerNidInList = function(nid, list) {
        var i = list.indexOf(nid);
        while(i >= 0 && ++i < list.length && !nodeDB[list[i]].display);
        return list[i];
    };

    var _getChildListHasNid = function(nid) {
        var parents = nodeDB[nodeDB[nid].link.parents];
        if(parents.link.left.indexOf(nid) >= 0) {
            return parents.link.left;
        } else if(parents.link.right.indexOf(nid) >= 0) {
            return parents.link.right;
        }
    };

    var _clone = function(buffer, nid, pid) {
        var clone = JSON.parse(JSON.stringify(nodeDB[nid]));
        clone.link.right = [];
        clone.link.left = [];
        clone.link.parents = pid;
        clone.lastVisit.left = null;
        clone.lastVisit.right = null;

        buffer.push(clone);
        var bufferId = buffer.length - 1;

        var childs = nodeDB[nid].link.right;
        for(var i in childs) {
            var childId = childs[i];
            if(nodeDB[childId].display) {
                var newChildIndex = _clone(buffer, childId, bufferId);
                buffer[bufferId].link.right.push(newChildIndex);
            }
        }
        var childs = nodeDB[nid].link.left;
        for(var i in childs) {
            var childId = childs[i];
            if(nodeDB[childId].display) {
                var newChildIndex = _clone(buffer, childId, bufferId);
                buffer[bufferId].link.left.push(newChildIndex);
            }
        }
        return bufferId;
    };

    var _pasteFromClipboard = function(clipId, pid, direct) {
        var newNode = JSON.parse(JSON.stringify(clipboard[clipId]));
        newNode.link.parents = pid;
        newNode.link.left = [];
        newNode.link.right = [];
        var nid = appendChild(pid, newNode);

        var childs = clipboard[clipId].link.right;
        for(var i in childs) {
            _pasteFromClipboard(childs[i], nid, direct);
        }
        var childs = clipboard[clipId].link.left;
        for(var i in childs) {
            _pasteFromClipboard(childs[i], nid, direct);
        }
        return nid;
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

    var findNodeRoot = function(nid) {
        while(nodeDB[nid].link.parents != nid) {
            nid = nodeDB[nid].link.parents;
        };
        return nid;
    };

    var create = function(parentsId) {
        nodeDB.push(new Node(parentsId));
        drawInfoDB.push(new DrawInfo());
        return nodeDB.length - 1;
    };

    var get = function(nid) {
        return nodeDB[nid];
    };

    var getDrawInfo = function(nid) {
        return drawInfoDB[nid];
    };

    var createRoot = function() {
        nodeDB.push(new Node(nodeDB.length));
        drawInfoDB.push(new DrawInfo());
        roots.push(nodeDB.length - 1);
        return nodeDB.length - 1;
    };

    var addNode = function(n) {
        nodeDB.push(n);
        drawInfoDB.push(new DrawInfo());
        return nodeDB.length - 1;
    }

    var swap = function(nid1, nid2) {
        var n = nodeDB[nid1];
        nodeDB[nid1] = nodeDB[nid2];
        nodeDB[nid2] = n;
    };

    var checkDirection = function(nid) {
        if(nodeDB[nid].link.parents == nid) {
            return DIRECT.ROOT;
        }
        var rootid = findNodeRoot(nid);
        while(nodeDB[nid].link.parents != rootid) {
            nid = nodeDB[nid].link.parents;
        }
        if(nodeDB[rootid].link.right.indexOf(nid) >= 0) {
            return DIRECT.RIGHT;
        } else {
            return DIRECT.LEFT;
        }
    };

    var checkDisplay = function(nid) {
        if(nid) {
            return nodeDB[nid].display;
        }
    };

    var getIdByPoint = function(x, y) {
        var node, drawInfo;
        for(var i in nodeDB) {
            node = nodeDB[i];
            drawInfo = drawInfoDB[i];
            if(node.display
                && drawInfo.drawPos.start.x <= x && x <= drawInfo.drawPos.end.x
                && drawInfo.drawPos.start.y <= y && y <= drawInfo.drawPos.end.y) {
                return Number(i);
            }
        }
        return null;
    };

    var addAfterSibling = function(nid) {
        var direct = checkDirection(nid);
        var parentsId = nodeDB[nid].link.parents;
        var siblingList;
        if(direct == DIRECT.RIGHT) {
            siblingList = nodeDB[parentsId].link.right;
        } else if(direct == DIRECT.LEFT) {
            siblingList = nodeDB[parentsId].link.left;
        }
        var childIndex = siblingList.indexOf(nid);
        nid = create(parentsId);
        siblingList.splice(childIndex + 1, 0, nid);
        return nid;
    };

    var addBeforeSibling = function(nid) {
        var direct = checkDirection(nid);
        var parentsId = nodeDB[nid].link.parents;
        var siblingList;
        if(direct == DIRECT.RIGHT) {
            siblingList = nodeDB[parentsId].link.right;
        } else if(direct == DIRECT.LEFT) {
            siblingList = nodeDB[parentsId].link.left;
        }
        var childIndex = siblingList.indexOf(nid);
        nid = create(parentsId);
        siblingList.splice(childIndex, 0, nid);
        return nid;
    };

    var copyToClipboard = function(nid) {
        clipboard = [];
        _clone(clipboard, nid, 0);
    };

    var pasteFromClipBoard = function(nid) {
        if(clipboard.length <= 0) {
            return nid;
        }
        var newChild = _pasteFromClipboard(0, nid, checkDirection(nid));
        return newChild;
    };

    var findUpperSibling = function(nid) {
        return _findUpperNidInList(nid, _getChildListHasNid(nid));
    };

    var findLowerSibling = function(nid) {
        return _findLowerNidInList(nid, _getChildListHasNid(nid));
    };

    var swapOrder = function(nid1, nid2) {
        var list = _getChildListHasNid(nid1);
        var i1 = list.indexOf(nid1);
        var i2 = list.indexOf(nid2);
        var temp = list[i1];
        list[i1] = list[i2];
        list[i2] = temp;
    };

    var moveToLeftNode = function(pid, nid) {
        var rightList = nodeDB[pid].link.right;
        var nidIndex = rightList.indexOf(nid);
        ArrayRemoveElement(rightList, nidIndex, nidIndex);
        nodeDB[pid].link.left.splice(0, 0, nid);
        _swapChildDirection(nid);
    };

    var moveToRightNode = function(pid, nid) {
        var leftList = nodeDB[pid].link.left;
        var nidIndex = leftList.indexOf(nid);
        ArrayRemoveElement(leftList, nidIndex, nidIndex);
        nodeDB[pid].link.right.push(nid);
        _swapChildDirection(nid);
    };

    var getParentsId = function(nid) { return nodeDB[nid].link.parents; };

    var getRoots = function() { return roots; };

    var hide = function(nid) { nodeDB[nid].display = false; };

    var show = function(nid) { nodeDB[nid].display = true; };

    var appendChild = function(parentsId, newNode) {
        nodeDB.push(newNode);
        drawInfoDB.push(new DrawInfo());
        var direct = checkDirection(parentsId);
        var childIndex = nodeDB.length - 1;
        if(direct == DIRECT.RIGHT) {
            nodeDB[parentsId].link.right.push(childIndex);
        } else if(direct == DIRECT.LEFT) {
            nodeDB[parentsId].link.left.push(childIndex);
        } else if(direct == DIRECT.ROOT) {
            var leftList = nodeDB[parentsId].link.left;
            var rightList = nodeDB[parentsId].link.right;
            if(_getChildListSize(rightList) <= _getChildListSize(leftList)) {
                rightList.push(childIndex);
            } else {
                leftList.push(childIndex);
            }
        }
        return childIndex;
    };

    var updateLastVisit = function(nid) {
        var pid = nodeDB[nid].link.parents;
        var dir = checkDirection(nid);
        if(dir == DIRECT.LEFT) {
            nodeDB[pid].lastVisit.left = nid;
        } else if(dir == DIRECT.RIGHT) {
            nodeDB[pid].lastVisit.right = nid;
        }
    }

    var importData = function(data) {
        nodeDB = data.nodeDB;
        roots = data.roots;
    };

    var exportData = function() {
        var buffer = [];
        for(var i in roots) {
            if(nodeDB[roots[i]].display) {
                _clone(buffer, roots[i], 0);
            }
        }
        return { nodeDB : buffer, roots : [0] };
    };

    // DB APIs
    var DBAPIs = {
        addAfterSibling : addAfterSibling,
        addBeforeSibling : addBeforeSibling,
        addNode : addNode,
        appendChild : appendChild,
        checkDirection : checkDirection,
        checkDisplay : checkDisplay,
        copyToClipboard : copyToClipboard,
        create : create,
        createRoot : createRoot,
        exportData : exportData,
        findLowerSibling : findLowerSibling,
        findNodeRoot : findNodeRoot,
        findUpperSibling : findUpperSibling,
        get : get,
        getDrawInfo : getDrawInfo,
        getIdByPoint : getIdByPoint,
        getParentsId : getParentsId,
        getRoots : getRoots,
        hide : hide,
        importData : importData,
        moveToLeftNode : moveToLeftNode,
        moveToRightNode : moveToRightNode,
        pasteFromClipboard : pasteFromClipBoard,
        show : show,
        swap : swap,
        swapOrder : swapOrder,
        updateLastVisit : updateLastVisit,
        gc: function(nid) {
            /*
            TODO : find nodes that unreachable from nid and
            display false
             */
        },
    };
    return DBAPIs;
}

function Map(config) {
    var users, db, undoList = [], currentUndoIndex = 0;
    var painter;
    var clipBoard = false;

    (function init() {
        db = new NodeDB();
        var nid = db.createRoot();
        users = new Users(nid, db);
        painter = new Painter(db, users, config);
    })();

    var getLeftChild = function(nid) {
        var node = db.get(nid);
        if(node.fold) {
            return nid;
        }
        if(db.checkDisplay(node.lastVisit.left)) {
            return node.lastVisit.left;
        }
        for(var i in node.link.left) {
            var child = db.get(node.link.left[i]);
            if(child.display) {
                return node.link.left[i];
            }
        }
        return nid;
    };

    var getRightChild = function(nid) {
        var node = db.get(nid);
        if(node.fold) {
            return nid;
        }
        if(db.checkDisplay(node.lastVisit.right)) {
            return node.lastVisit.right;
        }
        for(var i in node.link.right) {
            var child = db.get(node.link.right[i]);
            if(child.display) {
                return node.link.right[i];
            }
        }
        return nid;
    };

    var getClone = function(arg) {
        var nid = users.get(arg["uname"]);
        return JSON.parse(JSON.stringify(db.get(nid)));
    };

    var moveCursor = function(arg) {
        var nid = db.getIdByPoint(arg.x, arg.y);
        var oldNid = users.get("owner");
        if(nid != null && nid != oldNid) {
            users.update("owner", nid);
            return true;
        }
        return false;
    };

    var append = function(arg) {
        console.log("append");
        var currentNid = users.get(arg["uname"]);
        var newNode = new Node(currentNid);
        var newNodeId = db.appendChild(currentNid, newNode);
        users.update(arg["uname"], newNodeId);
        appendUndo(function() {
            db.hide(newNodeId);
            users.update(arg["uname"], currentNid);
        } , function() {
            db.show(newNodeId);
            users.update(arg["uname"], newNodeId);
        });
    };

    var hide = function(arg) {
        var currentNid = users.get(arg["uname"]);
        if(db.findNodeRoot(currentNid) == currentNid) {
            db.hide(currentNid);
            var newNodeId = db.createRoot();
            users.update(arg["uname"], newNodeId);
            appendUndo(function() {
                    db.hide(newNodeId);
                    db.show(currentNid);
                    users.update(arg["uname"], currentNid);
                }, function() {
                    db.hide(currentNid);
                    db.show(newNodeId);
                    users.update(arg["uname"], newNodeId);
                });
        } else {
            var parentsNodeId = db.getParentsId(currentNid);
            users.update(arg["uname"], parentsNodeId);
            db.hide(currentNid);
            appendUndo(function() {
                    db.show(currentNid);
                    users.update(arg["uname"], currentNid);
                }, function() {
                    db.hide(currentNid);
                    users.update(arg["uname"], parentsNodeId);
                });
        }
    };

    var undo = function() { undoList[--currentUndoIndex].undo(); };

    var redo = function() { undoList[currentUndoIndex++].redo(); };

    var appendUndo = function(undoFunc, redoFunc) {
        ArrayRemoveElement(undoList, currentUndoIndex, undoList.length - 1);
        undoList.push({undo : undoFunc, redo : redoFunc});
        currentUndoIndex++;
    };

    var addAfterSibling = function() {
        var nid = users.get("owner");
        if(db.checkDirection(nid) != DIRECT.ROOT) {
            nid = db.addAfterSibling(nid);
            users.update("owner", nid);
        }
    };

    var addBeforeSibling = function() {
        var nid = users.get("owner");
        if(db.checkDirection(nid) != DIRECT.ROOT) {
            nid = db.addBeforeSibling(nid);
            users.update("owner", nid);
        }
    };

    var edit = function(args) {
        var nid = users.get(args["uname"]);
        var newNid = db.addNode(args["node"]);
        db.swap(nid, newNid);
        appendUndo(function() {
            db.swap(newNid, nid);
        }, function() {
            db.swap(nid, newNid);
        });
    };

    var keyLeft = function() {
        var nid = users.get("owner");
        var direct = db.checkDirection(nid);
        if(direct == DIRECT.ROOT || direct == DIRECT.LEFT) {
            users.update("owner", getLeftChild(nid));
        } else if(direct == DIRECT.RIGHT) {
            users.update("owner", db.getParentsId(nid));
        }
    };

    var keyRight = function() {
        var nid = users.get("owner");
        var direct = db.checkDirection(nid);
        if(direct == DIRECT.ROOT || direct == DIRECT.RIGHT) {
            users.update("owner", getRightChild(nid));
        } else if(direct == DIRECT.LEFT) {
            users.update("owner", db.getParentsId(nid));
        }
    };

    var keyUp = function(canvasHeight) {
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
        var drawInfo = db.getDrawInfo(nid);
        var posY, posX;
        var marginNodeTop = config.get("marginNodeTop");
        posX = drawInfo.drawPos.start.x;
        posY = drawInfo.drawPos.start.y - marginNodeTop;
        for(; posY > 0; posY -= marginNodeTop) {
            nid = db.getIdByPoint(posX, posY);
            if(nid != null) {
                users.update("owner", nid);
                break;
            }
        }
        // no node...
    };

    var keyDown = function(canvasHeight) {
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
        var drawInfo = db.getDrawInfo(nid);
        var posY, posX;
        var marginNodeTop = config.get("marginNodeTop");
        posX = drawInfo.drawPos.start.x;
        posY = drawInfo.drawPos.end.y + marginNodeTop;
        for(; posY < canvasHeight; posY += marginNodeTop) {
            nid = db.getIdByPoint(posX, posY);
            if(nid != null) {
                users.update("owner", nid);
                break;
            }
        }
        // no node...
    };

    var orderUp = function() {
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
            var rootId = db.findNodeRoot(nid);
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

    var orderDown = function() {
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
            var rootId = db.findNodeRoot(nid);
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

    var fold = function() {
        var nid = users.get("owner");
        var direct = db.checkDirection(nid);
        if(direct != DIRECT.ROOT) {
            var node = db.get(nid);
            if(direct == DIRECT.RIGHT && node.link.right.length > 0) {
                node.fold = !node.fold;
            } else if(direct == DIRECT.LEFT && node.link.left.length > 0) {
                node.fold = !node.fold;
            }
        }
    }

    var copy = function() {
        var nid = users.get("owner");
        db.copyToClipboard(nid);
    };

    var cut = function() {
        var nid = users.get("owner");
        db.copyToClipboard(nid);
        hide({"uname":"owner"});
    };

    var paste = function() {
        var nid = users.get("owner");
        nid = db.pasteFromClipboard(nid);
    };

    var draw = function(args) {
        var roots = db.getRoots();
        for(var i in roots) {
            args["root"] = roots[i];
            painter.drawTree(args);
        }
    };

    var title = function() {
        var roots = db.getRoots();
        for(var i in roots) {
            if(db.get(roots[i]).display) {
                return db.get(roots[i]).data;
            }
        }
    };

    var fromJSON = function(dataStr) {
        var data = JSON.parse(dataStr);
        db.importData(data.db);
        users.update("owner", 0);
    }

    var toJSON = function() {
        var data = { db : db.exportData(), users : users.get("owner") };
        return JSON.stringify(data);
    };

    var mapAPIs = {
        addAfterSibling : addAfterSibling,
        addBeforeSibling : addBeforeSibling,
        append : append,
        copy : copy,
        cut : cut,
        draw : draw,
        edit : edit,
        fold : fold,
        getClone : getClone,
        keyDown : keyDown,
        keyLeft : keyLeft,
        keyRight : keyRight,
        keyUp : keyUp,
        measureWidth : painter.measureWidth,
        moveCanvas : painter.moveCanvas,
        moveCursor : moveCursor,
        orderDown : orderDown,
        orderUp : orderUp,
        paste : paste,
        redo : redo,
        remove : hide,
        undo : undo,
        redo : redo,
        title : title,
        toJSON : toJSON,
        fromJSON : fromJSON,
    };
    return mapAPIs;
}

function Painter(db, users, config) {
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
            ctx.beginPath();
            drawNodeTree(ctx, node, nid, posX, posY);
            ctx.closePath();
        }
    }

    var drawSetup = function(ctx, node) {
        ctx.fillStyle = node.font.color;
        ctx.font = node.font.size + "px " + node.font.face;
    }

    var drawNode = function(ctx, node, nid, posX, posY) {
        var uname = users.getNameById(nid);
        if(uname != null) {
            ctx.fillStyle = config.get("cursorColor");
        } else {
            ctx.fillStyle = node.font.bgColor;
        }
        var margin = config.get("cursorMargin");
        var drawInfo = db.getDrawInfo(nid);
        ctx.fillRect(posX, posY - drawInfo.measure.height,
                     drawInfo.measure.width + margin,
                     drawInfo.measure.height + margin);

        // draw node
        drawSetup(ctx, node);
        ctx.fillText(node.data, posX, posY);

        // draw under line
        ctx.beginPath();
        ctx.fillStyle = node.font.edgeColor;
        ctx.lineWith = 1;
        ctx.moveTo(posX, posY + 2);
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
        ctx.fillStyle = node.font.edgeColor;
        ctx.lineWidth = node.font.edgeThick;
        var EdgeBezier = config.get("marginNodeLeft") / 2;
        ctx.moveTo(fromX, fromY + 2);
        ctx.bezierCurveTo(fromX - EdgeBezier, fromY + 2, toX + EdgeBezier,
                          toY + 2, toX, toY + 2);
        ctx.stroke();
    };

    var drawRightEdge = function(ctx, node, fromX, fromY, toX, toY) {
        ctx.fillStyle = node.font.edgeColor;
        ctx.lineWidth = node.font.edgeThick;
        var EdgeBezier = config.get("marginNodeLeft") / 2;
        ctx.moveTo(fromX, fromY + 2);
        ctx.bezierCurveTo(fromX + EdgeBezier, fromY + 2, toX - EdgeBezier,
                          toY + 2, toX, toY + 2);
        ctx.stroke();
    };

    var drawLeftChilds = function(ctx, node, nid, posX, posY) {
        var fromX = posX;
        var fromY = posY;
        var marginNodeLeft = config.get("marginNodeLeft");
        var marginNodeTop = config.get("marginNodeTop");
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
        posX = posX + drawInfo.measure.width + config.get("marginNodeLeft");
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
                    drawRightEdge(ctx, child, fromX, fromY,
                                  posX, posY + childDrawInfo.rHeight / 2);
                    drawNodeTree(ctx, child, childId, posX,
                                 posY + childDrawInfo.rHeight / 2);
                } else {
                    drawRightEdge(ctx, child, fromX, fromY,
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

    var measureTextPlain = function(n) {
        return {
            width : ctx.measureText(n.data).width + config.get("cursorMargin"),
            height : n.font.size
        };
    };

    var measureWidth = function(n) {
        drawSetup(ctx, n);
        return measureFuncs[n.mimetype](n).width;
    };

    var measureTree = function(ctx, nid) {
        // prepare
        var node = db.get(nid);
        if(!node.display) {
            return 0;
        }
        var drawInfo = db.getDrawInfo(nid);
        marginNodeTop = config.get("marginNodeTop");
        marginNodeLeft = config.get("marginNodeLeft");

        // measure setup
        drawSetup(ctx, node);
        drawInfo.measure = measureFuncs[node.mimetype](node);

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

    var measureFuncs = {
        "text/plain" : measureTextPlain,
        "text/html" : null,
        "text/uri-list" : null,
        "image" : null,
        "audio" : null,
    };

    var painterAPIs = {
        moveCanvas : moveCanvas,
        drawTree : drawNodeAndChilds,
        measureWidth : measureWidth,
    };
    return painterAPIs;
}
