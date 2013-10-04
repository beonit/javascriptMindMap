function Editor() {
	var editTextPlain = function(n, callback) {
		n.data = "beonit edit node now";
		callback(n);
	};

	var editTextHtml = function(n, callback) {
		$('#editModal').modal('show');
	};

	var editUri = function(n, callback) {
		$('#editModal').modal('show');
	};

	var editImage = function(n, callback) {
		$('#editModal').modal('show');
	};

	var editAudio = function(n, callback) {
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

