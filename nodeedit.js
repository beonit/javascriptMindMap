function Editor(mapArgs) {

	var editTextPlain = function(n, callbacks) {
		var input = document.getElementById(mapArgs.inputTextPlainId);
		input.style.left = n.drawPos.start.x + "px";
		input.style.top = n.drawPos.start.y + "px";
		input.style.width = n.measure.width + 10 + "px";
		input.value = n.data;
		input.style.display = "block";
		input.focus();
		input.select();
		var minWidth = n.measure.width;
		var keyListener = function(e) {
			n.data = input.value;
			var newWidth = callbacks["measure"](n);
			if(callbacks[e.keyCode]) {
				input.removeEventListener("keydown", keyListener);
				input.style.display = "none";
				callbacks[e.keyCode](n);
			} if(newWidth > minWidth) {
				input.style.width = newWidth + 10 + "px";
			}
		};
		input.addEventListener("keydown", keyListener, false);
	};


	var editTextHtml = function(n, callbacks) {
		$('#editModal').modal('show');
	};

	var editUri = function(n, callbacks) {
		$('#editModal').modal('show');
	};

	var editImage = function(n, callbacks) {
		$('#editModal').modal('show');
	};

	var editAudio = function(n, callbacks) {
		$('#editModal').modal('show');
	};

	var editMode = {
	    "text/plain" : editTextPlain,
	    "text/html" : editTextHtml,
	    "text/uri-list" : editUri,
	    "image" : editImage,
	    "audio" : editAudio,
	};

	return editMode;
}