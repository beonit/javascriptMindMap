function NodeDB(nodeFuncs) {
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
        var n = new Node(parentsId);
        n.hash = nodeDB.length;
        nodeDB.push(n);
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
        var n = new Node(nodeDB.length);
        n.hash = nodeDB.length;
        nodeDB.push(n);
        drawInfoDB.push(new DrawInfo());
        roots.push(nodeDB.length - 1);
        return nodeDB.length - 1;
    };

    var addNode = function(n) {
        n.hash = nodeDB.length;
        nodeDB.push(n);
        drawInfoDB.push(new DrawInfo());
        return nodeDB.length - 1;
    };

    var swap = function(nid1, nid2) {
        // swap node index
        var n = nodeDB[nid1];
        nodeDB[nid1] = nodeDB[nid2];
        nodeDB[nid2] = n;
        // swap hash
        var t = nodeDB[nid1].hash;
        nodeDB[nid1].hash = nodeDB[nid2].hash
        nodeDB[nid2].hash = t;
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

    var addSiblingAfter = function(nid) {
        var direct = checkDirection(nid);
        var parentsId = nodeDB[nid].link.parents;
        var siblingList;
        if(direct == DIRECT.RIGHT) {
            siblingList = nodeDB[parentsId].link.right;
        } else if(direct == DIRECT.LEFT) {
            siblingList = nodeDB[parentsId].link.left;
        }
        var childIndex = siblingList.indexOf(nid);
        var newNodeId = create(parentsId);
        siblingList.splice(childIndex + 1, 0, newNodeId);
        return newNodeId;
    };

    var addSiblingBefore = function(nid) {
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

    var toggleFold = function(nid) {
        var n = nodeDB[nid];
        n.fold = !n.fold;
        if(n.fold) {
            propagateHideEvent(nid);
        } else {
            propagateShowEvent(nid);
        }
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

    var hide = function(nid) {
        var n = nodeDB[nid];
        n.display = false;
        nodeFuncs[n.mimetype].onHide(n);
        propagateHideEvent(nid);
    };

    var show = function(nid) {
        var n = nodeDB[nid];
        n.display = true;
        nodeFuncs[n.mimetype].onUnhide(n);
        propagateShowEvent(nid);
    };

    var appendChild = function(parentsId, newNode) {
        newNode.hash = nodeDB.length;
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

    var propagateShowEvent = function(nid) {
        var n = nodeDB[nid];
        var child;
        for(var i in n.link.left) {
            child = nodeDB[n.link.left[i]];
            if(child.display) {
                nodeFuncs[child.mimetype].onUnhide(child);
                if(!child.fold) {
                    propagateShowEvent(n.link.left[i]);
                }
            }
        }
        for(var i in n.link.right) {
            child = nodeDB[n.link.right[i]];
            if(child.display) {
                nodeFuncs[child.mimetype].onUnhide(child);
                if(!child.fold) {
                    propagateShowEvent(n.link.right[i]);
                }
            }
        }
    }

    var propagateHideEvent = function(nid) {
        var n = nodeDB[nid];
        var child;
        for(var i in n.link.left) {
            child = nodeDB[n.link.left[i]];
            if(child.display) {
                nodeFuncs[child.mimetype].onHide(child);
                if(!child.fold) {
                    propagateHideEvent(n.link.left[i]);
                }
            }
        }
        for(var i in n.link.right) {
            child = nodeDB[n.link.right[i]];
            if(child.display) {
                nodeFuncs[child.mimetype].onHide(child);
                if(!child.fold) {
                    propagateHideEvent(n.link.right[i]);
                }
            }
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
        addSiblingAfter : addSiblingAfter,
        addSiblingBefore : addSiblingBefore,
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
        toggleFold : toggleFold,
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
};
