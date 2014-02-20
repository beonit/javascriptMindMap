function Map(nodeFuncs) {
    var users, db, undoList = [], currentUndoIndex = 0;
    var painter;
    var clipBoard = false;
    var canvasHeight, canvasWidth;

    (function() {
        db = new NodeDB(nodeFuncs);
        var nid = db.createRoot();
        users = new Users(nid, db);
        painter = new Painter(db, users, nodeFuncs);
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

    var moveCursor = function(arg) {
        var nid = db.getIdByPoint(arg.x, arg.y);
        var oldNid = users.get("owner");
        if(nid != null && nid != oldNid) {
            users.update("owner", nid);
            return true;
        }
        return false;
    };

    var append = function(uname) {
        var currentNid = users.get(uname);
        var newNode = new Node(currentNid);
        var newNodeId = db.appendChild(currentNid, newNode);
        users.update(uname, newNodeId);
        appendUndo(function() {
            db.hide(newNodeId);
            users.update(uname, currentNid);
        } , function() {
            db.show(newNodeId);
            users.update(uname, newNodeId);
        }, null);
    };

    var hide = function(uname) {
        var currentNid = users.get(uname);
        if(db.findNodeRoot(currentNid) == currentNid) {
            db.hide(currentNid);
            var newNodeId = db.createRoot();
            users.update(uname, newNodeId);
            appendUndo(function() {
                users.update(uname, currentNid);
                db.hide(newNodeId);
                db.show(currentNid);
            }, function() {
                users.update(uname, newNodeId);
                db.hide(currentNid);
                db.show(newNodeId);
            }, null);
        } else {
            var parentsNodeId = db.getParentsId(currentNid);
            users.update(uname, parentsNodeId);
            db.hide(currentNid);
            appendUndo(function() {
                users.update(uname, currentNid);
                db.show(currentNid);
            }, function() {
                users.update(uname, parentsNodeId);
                db.hide(currentNid);
            }, null);
        }
    };

    var undo = function() {
        if(currentUndoIndex > 0) {
            undoList[--currentUndoIndex].undo();
        }
    };

    var redo = function() {
        if(currentUndoIndex < undoList.length) {
            undoList[currentUndoIndex++].redo();
        }
    };

    var appendUndo = function(undoFunc, redoFunc, hookFunc) {
        ArrayRemoveElement(undoList, currentUndoIndex, undoList.length - 1);
        undoList.push({undo : undoFunc, redo : redoFunc});
        currentUndoIndex++;
        if(hookFunc) {
            hookFunc();
        }
    };

    var addSiblingAfter = function() {
        var nid = users.get("owner");
        if(db.checkDirection(nid) != DIRECT.ROOT) {
            var newNodeId = db.addSiblingAfter(nid);
            users.update("owner", newNodeId);
            appendUndo(function() {
                db.hide(newNodeId);
                users.update("owner", nid);
                var n = db.get(newNodeId);
                nodeFuncs[n.mimetype].onHide(n);
            }, function() {
                db.show(newNodeId);
                users.update("owner", newNodeId);
                var n = db.get(newNodeId);
                nodeFuncs[n.mimetype].onUnhide(n);
            }, null);
        }
    };

    var addSiblingBefore = function() {
        var nid = users.get("owner");
        if(db.checkDirection(nid) != DIRECT.ROOT) {
            var newNodeId = db.addSiblingBefore(nid);
            users.update("owner", newNodeId);
            appendUndo(function() {
                db.hide(newNodeId);
                users.update("owner", nid);
                var n = db.get(newNodeId);
                nodeFuncs[n.mimetype].onHide(n);
            }, function() {
                db.show(newNodeId);
                users.update("owner", newNodeId);
                var n = db.get(newNodeId);
                nodeFuncs[n.mimetype].onUnhide(n);
            }, null);
        }
    };

    var edit = function(uname, node) {
        var nid = users.get(uname);
        var newNid = db.addNode(node);
        db.swap(nid, newNid);
        appendUndo(function() {
            db.swap(newNid, nid);
        }, function() {
            db.swap(nid, newNid);
        }, null);
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

    var keyUp = function() {
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
        var marginNodeTop = gMapConfig.get("marginNodeTop");
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

    var keyDown = function() {
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
        var marginNodeTop = gMapConfig.get("marginNodeTop");
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
                }, null);
        } else if(!siblingid && DIRECT.LEFT == db.checkDirection(nid)) {
            var parentsId = db.getParentsId(nid);
            var rootId = db.findNodeRoot(nid);
            if(parentsId == rootId) {
                db.moveToRightNode(parentsId, nid);
                appendUndo(function() {
                        db.moveToLeftNode(parentsId, nid);
                    }, function() {
                        db.moveToRightNode(parentsId, nid);
                    }, null);
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
                }, null);
        } else if(!siblingid && DIRECT.RIGHT == db.checkDirection(nid)) {
            var parentsId = db.getParentsId(nid);
            var rootId = db.findNodeRoot(nid);
            if(parentsId == rootId) {
                db.moveToLeftNode(parentsId, nid);
                appendUndo(function() {
                        db.moveToRightNode(parentsId, nid);
                    }, function() {
                        db.moveToLeftNode(parentsId, nid);
                    }, null);
            }
        }
    };

    var fold = function() {
        var nid = users.get("owner");
        var direct = db.checkDirection(nid);
        if(direct == DIRECT.ROOT) {
            return;
        }
        db.toggleFold(nid);
        appendUndo(function() {
            db.toggleFold(nid);
        }, function() {
            db.toggleFold(nid);
        }, null);
    }

    var copy = function() {
        var nid = users.get("owner");
        db.copyToClipboard(nid);
    };

    var cut = function() {
        var nid = users.get("owner");
        db.copyToClipboard(nid);
        hide("owner");
    };

    var paste = function() {
        var nid = users.get("owner");
        nid = db.pasteFromClipboard(nid);
        appendUndo(function() {
            db.hide(nid);
        }, function() {
            db.show(nid);
        }, null);
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

    var setWithHeight = function(width, height) {
        canvasWidth = width;
        canvasHeight = height;
    };

    var startEdit = function(ctx, finishCallback) {
        var nid = users.get("owner");
        var oldNode = db.get(nid);
        var newNode = JSON.parse(JSON.stringify(oldNode));
        var drawInfo = JSON.parse(JSON.stringify(db.getDrawInfo(nid)));
        var editFinish = function() {
            nodeFuncs[newNode.mimetype].finishEdit(oldNode, newNode);
            finishCallback();
            mapAPIs.submitEdit = null;
            mapAPIs.cancelEdit = null;
        };
        var submit = function() {
            edit("owner", newNode);
            editFinish();
        };
        var cancel = function() {
            editFinish();
        };
        mapAPIs.submitEdit = submit;
        mapAPIs.cancelEdit = cancel;
        nodeFuncs[newNode.mimetype].startEdit(ctx, newNode, drawInfo,
                                              submit, cancel);
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
        addSiblingAfter : addSiblingAfter,
        addSiblingBefore : addSiblingBefore,
        append : append,
        cancelEdit : null,
        copy : copy,
        cut : cut,
        draw : draw,
        fold : fold,
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
        setWithHeight : setWithHeight,
        startEdit : startEdit,
        submitEdit : null,
        undo : undo,
        redo : redo,
        title : title,
        toJSON : toJSON,
        fromJSON : fromJSON,
    };
    return mapAPIs;
}
