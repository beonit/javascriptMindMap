function MapController(mapArgs) {
    var rootX = 0, rootY = 0;
    var map = new Map(mapArgs["config"]);

    this.save = function() {
        jsonStr = map.toJSON();
        console.log(jsonStr);
    }

    this.load = function () {
        map.load();
    }

    this.add = function() {
        map.append("owner");
    }

    this.delete = function() {
        map.remove("owner");
    }

    this.editMode = function() {
    }

    this.FreeMindmapLoad = function (event) {
        var canvas = document.getElementById(mapArgs.mapId),
        container = document.getElementById(mapArgs.containerId),
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
            ctx.fillStyle = mapArgs.config.get('backgroundColor');
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // draw text
            rootX = canvas.width / 2;
            rootY = canvas.height / 2;
            map.draw(ctx, rootX, rootY);
        }
    }
}

mm = new MapController({
    config : CreateMapConfig(),
    mapId : "freemindmap",
    containerId : "mapContainer"});
mm.add();
mm.add();
mm.delete();
mm.save();

if (window.addEventListener) { // Mozilla, Netscape, Firefox
    window.addEventListener('load', mm.FreeMindmapLoad, false);
} else if (window.attachEvent) { // IE
    window.attachEvent('onload', mm.FreeMindmapLoad);
}