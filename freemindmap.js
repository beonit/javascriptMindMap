if (window.addEventListener) { // Mozilla, Netscape, Firefox
    window.addEventListener('load', FreeMindmapLoad, false);
} else if (window.attachEvent) { // IE
    window.attachEvent('onload', FreeMindmapLoad);
}

function FreeMindmapLoad(event) {
    var canvas = document.getElementById('freemindmap'),
    ctx = canvas.getContext('2d');
    rootX = 100, rootY = 100;
    config = new MapConfig();    
    map = new Map(config);

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
        ctx.fillStyle = config.get('backgroundColor');
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // draw text
        rootX = canvas.width / 2;
        rootY = canvas.height / 2;
        map.draw(ctx, rootX, rootY);
    }
}