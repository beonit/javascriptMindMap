if (window.addEventListener) { // Mozilla, Netscape, Firefox
    window.addEventListener('load', FreeMindmapLoad, false);
} else if (window.attachEvent) { // IE
    window.attachEvent('onload', FreeMindmapLoad);
}

var CONFIG = (function() {
    var private = {
        'background':"#FFFFFF",
        'textcolor':"#000000",
        'font':"30px Arial"
    };

    return {
        get: function(name) { return private[name]; }
    };
})();

function FreeMindmapLoad(event) {
    var canvas = document.getElementById('freemindmap'),
    ctx = canvas.getContext('2d');
    mapData = {"data":{"left":null , "right":null}}

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
        // draw background
        ctx.fillStyle = CONFIG.get('background');
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // draw text
        ctx.font = CONFIG.get('font');
        ctx.fillStyle = CONFIG.get('textcolor');
        ctx.fillText("Hello World",10,50);
    }
}