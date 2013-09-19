function ArrayRemoveElement(a, from, to) {
    var rest = a.slice((to||from) + 1 || a.length);
    a.length = from < 0 ? a.length + from : from;
    return a.push.apply(a, rest);
};

function CreateMapConfig() {
    var private = {
        'backgroundColor':"#FFFFFF",
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
    this.childs = [];
    this.parents = parentsId;
    this.rechable = true;
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
    var utils = {
        clone : function(indexes) { return 0; },
    }

    return {
        create : function(parentsId) {
            nodeDB.push(new Node(parentsId));
            return nodeDB.length - 1;
        },
        get : function(nid) { return nodeDB[nid]; },
        replace : function(nid, node) { nodeDB[nid] = node; },
        remove : function(nid) { nodeDB[nid] = null; },
        gc: function(nid) { /* TODO : find nodes that unreachable from nid */ },
        toJSON : function() { return JSON.stringify(nodeDB); }
    }
}

function Map(config) {
    var users, db;
    (function init() {
        db = new NodeDB();
        nid = db.create(0);
        users = new Users(nid);
    })();

    _draw = function(arg) {
        arg["ctx"].fillStyle = config.get('fontColor');
        arg["ctx"].font = config.get('fontSize') + " " + config.get('fontFace');
    };
    _append = function(arg) {
        currentNodeId = users.get(arg["uname"]);
        currentNode = db.get(currentNodeId);
        newNodeId = db.create(currentNodeId);
        currentNode.childs.push(newNodeId);
        users.update(arg["uname"], newNodeId);
    };
    _get = function(arg) { return db.get(users.get(arg["uname"])); };
    _remove = function(arg) {
        currentNodeId = users.get(arg["uname"]);
        currentNode = db.get(currentNodeId);
        parentsNodeId = currentNode.parents;
        parentsNode = db.get(parentsNodeId);
        from = parentsNode.childs.indexOf(currentNodeId);
        ArrayRemoveElement(parentsNode.childs, from, from);
        users.update(arg["uname"], parentsNodeId);
    };
    _undo = function() {};
    _redo = function() {};
    _clone = function() {};
    _toJSON = function() { return JSON.stringify(db); };

    return {
        draw : _draw,
        append : _append,
        get : _get,
        remove : _remove,
        clone : _clone,
        undo : _undo,
        redo : _redo,
        toJSON : _toJSON,
    };
}