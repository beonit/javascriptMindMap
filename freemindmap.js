if (window.addEventListener) { // Mozilla, Netscape, Firefox
    window.addEventListener('load', FreeMindmapLoad, false);
} else if (window.attachEvent) { // IE
    window.attachEvent('onload', FreeMindmapLoad);
}

function FreeMindmapLoad(event) {
    var canvas = document.getElementById('freemindmap'),
    ctx = canvas.getContext('2d');

    // resize the canvas to fill browser window dynamically
    window.addEventListener('resize', resizeCanvas, false);

    function resizeCanvas() {
	    canvas.width = window.innerWidth;
	    canvas.height = window.innerHeight;
	    /**
	     * Your drawings need to be inside this function otherwise they will be reset when 
	     * you resize the browser window and the canvas goes will be cleared.
	     */
	    drawStuff(); 
    }
    
    resizeCanvas();

    function drawStuff() {
        console.log("beonit");
        ctx.fillStyle="#FF0000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}