var type_editor = function(modalId) {
    var node, submitEdit, cancelEdit;

    var onSubmitButonClick = function(e) {
        var tabName = node.mimetype.replace("/", "_");
        node.data = $("#" + tabName + " .input-node-data")[0].value;
        var extraInput = $("#" + tabName + " .input-node-extra");
        if(extraInput.length >= 1) {
            node.extra = extraInput[0].value;
        }
        submitEdit();
        $(modalId).modal('hide');
    }

    var onCancelButonClick = function(e) {
        cancelEdit();
    }

    var setInputValueAs = function(className, value) {
        var inputs = $(className);
        for(var i in inputs) {
            inputs[i].value = value;
        }
    };

    var onChnageTab = function (e) {
        var tab = e.target.href;
        tab = tab.substring(document.URL.length + 1, tab.length);
        node.mimetype = tab.replace("_", "/");
    }

    var startEdit = function(newNode, submit, cancel) {
        node = newNode;
        mimetype = node.mimetype;
        submitEdit = submit;
        cancelEdit = cancel;
        $(modalId).modal('show');

        var tabName = node.mimetype.replace("/", "_");
        $(modalId + ' a[href="#' + tabName + '"]').tab('show');
        $('a[data-toggle="tab"]').on('shown.bs.tab', onChnageTab);

        setInputValueAs(".input-node-data", newNode.data);
        setInputValueAs(".input-node-extra", newNode.extra);

        $('#typeEditorModalSubmit').click(onSubmitButonClick);
        $('#typeEditorModalCancel').click(onCancelButonClick);
    };

    return {
        startEdit : startEdit,
    };
};
