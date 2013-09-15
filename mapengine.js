function MapConfig() {
    var private = {
        'backgroundColor':"#FFFFFF",
        'fontColor':"#000000",
        'fontSize':12,
        'fontFace':"Arial"
    };

    return {
        get: function(name) { return private[name]; },
        set: function(name, value) { private[name] = value; }
    };
};

function Node() {
    this.text = "default";
    this.measure = function(ctx) {
        return ctx.measureText(this.text);
    }

    this.draw = function(ctx, x, y) {

        ctx.fillText(this.text, x, y);
    }
}

function Map(config) {
    var root = new Node(),
    leftNodes = [], rightNodes = [],
    CONFIG = config;

    this.draw = function(ctx, x, y) {
        ctx.fillStyle = CONFIG.get('fontColor');
        ctx.font = CONFIG.get('fontSize') + " " + CONFIG.get('fontFace');
        root.draw(ctx, x - root.measure(ctx).width / 2, y);
    }
}