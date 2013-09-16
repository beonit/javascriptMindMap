function MapController(mapId, containerId, config) {
    rootX = 0, rootY = 0;
    map = new Map(config);

    this.FreeMindmapLoad = function (event) {
        var canvas = document.getElementById(mapId),
        container = document.getElementById(containerId),
        ctx = canvas.getContext('2d');
        // resize the canvas to fill browser window dynamically
        window.addEventListener('resize', resizeCanvas, false);

        function resizeCanvas() {
            canvas.width = container.offsetWidth;
            canvas.height = container.offsetHeight;
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
}

config = new MapConfig();
mapController = new MapController("freemindmap", "mapContainer", config);

if (window.addEventListener) { // Mozilla, Netscape, Firefox
    window.addEventListener('load', mapController.FreeMindmapLoad, false);
} else if (window.attachEvent) { // IE
    window.attachEvent('onload', mapController.FreeMindmapLoad);
}