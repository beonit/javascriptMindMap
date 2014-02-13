function KeyMapper(map) {
    return {
        enter : function(e) { return true; },
        fold : function(e) { map.fold(); return true; },
        addSiblingAfter : function(e) {
            map.addSiblingAfter(); return true;
        },
        addSiblingBefore : function(e) {
            map.addSiblingBefore(); return true;
        },
        save : function(e) { return false; },
        bold : function(e) { return true; },
        italic : function(e) { return true; },
        cut : function(e) { map.cut(); return true; },
        copy : function(e) { map.copy(); return true; },
        paste : function(e) { map.paste(); return true; },
        undo : function(e) { return map.undo(); true; },
        redo : function(e) { return map.redo(); true; },
        directRight : function(e) { map.keyRight(); return true; },
        directUp : function(e) { map.keyUp(); return true; },
        directLeft : function(e) { map.keyLeft(); return true; },
        directDown : function(e) { map.keyDown(); return true; },
        altLeft : function(e) { return true; },
        altUp : function(e) { map.orderUp(); return true; },
        altRight : function(e) { return true; },
        altDown : function(e) { map.orderDown(); return true; },
        insert : function(e) {
            map.append("owner");
            return true;
        },
        delete : function(e) {
            map.remove("owner");
            return true;
        },
        home : function(e) { return true; },
        f1 : function(e) { return true; },
    }
};
