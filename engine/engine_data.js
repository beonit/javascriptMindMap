var DIRECT = {ROOT:0, LEFT:1, RIGHT:2};

function ArrayRemoveElement(a, from, to) {
    var rest = a.slice((to||from) + 1 || a.length);
    a.length = from < 0 ? a.length + from : from;
    return a.push.apply(a, rest);
};

function Node(parentsId) {
    // data
    this.mimetype = "text/uri";
    this.data = "default";
    this.hash = null;
    this.font = { face : "Arial",
                  size : 15,
                  color : "#000000",
                  bgColor : "#ffffff",
                };
    this.edge = { color : "#000000",
                  thick : 1
                };
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
