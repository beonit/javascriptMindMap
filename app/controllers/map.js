var mongoose = require('mongoose')
    , User = mongoose.model('User')
    , Map = mongoose.model('Map')
    , utils = require('../../lib/utils')


/*!
 * Module dependencies.
 */

exports.index = function (req, res) {
    res.render('map/map', {
        title: 'Draw up your mind'
    })
}

/**
 * List
 */

exports.list = function(req, res){
    var page = (req.param('page') > 0 ? req.param('page') : 1) - 1
    var perPage = 10
    var options = {
        perPage: perPage,
        page: page
    }

    Map.list(options, function(err, maps) {
        if (err) {
            utils.jsonPage(res, {"status":false, "msg":"map listing fail"});
        }

        Map.count().exec(function (err, count) {
            var rtnData = {"status":true, "maps":[]};
            for(var i in maps) {
                rtnData.maps.push({
                    "title":maps[i].title,
                    "createdAt":maps[i].createdAt
                });
            }
            utils.jsonPage(res, rtnData);
        })
    })
}

/**
 * List
 */

exports.save = function (req, res) {
    var map = new Map(req.body)
    map.user = req.user
    map.save()

    console.log("save func : " + req.user.name);
    utils.jsonPage({"status":true, "user":req.user.name});
}
