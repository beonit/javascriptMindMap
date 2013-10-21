var mongoose = require('mongoose')
    , User = mongoose.model('User')
    , Map = mongoose.model('Map')
    , utils = require('../../lib/utils')
    , _ = require('underscore')

/*!
 * Module dependencies.
 */

/**
 * Show title
 */

exports.index = function (req, res) {
    res.render('map/default', {
        title: 'Draw up your mind',
        signup: 'Sign up',
        login: 'Login',
    })
}

/**
 * Draw empty map
 */

exports.empty = function (req, res) {
    res.render('map/map', {
        title : 'Draw up your mind',
        session : utils.sessionState(req),
    })
}

/**
 * Draw some map
 */

exports.show = function (req, res) {
    res.render('map/map', {
        title : 'Draw up your mind',
        session : utils.sessionState(req),
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
            utils.jsonPage(res, {"status" : false, "msg" : "map listing fail"});
        }

        Map.count().exec(function (err, count) {
            var rtnData = {"status" : true, "maps" : []};
            for(var i in maps) {
                rtnData.maps.push({
                    "title":maps[i].title,
                    "createdAt":maps[i].createdAt,
                    "id":maps[i]._id,
                });
            }
            utils.jsonPage(res, rtnData);
        })
    })
}

/**
 * Create a map
 */

exports.create = function (req, res) {
    var map = new Map(req.body);
    map = _.extend(map, req.body);
    map.user = req.user;
    map.save();
    utils.jsonPage(res, {"status" : true, "id" : map._id});
}

/**
 * Update map
 */

exports.update = function(req, res){
    var map = req.map;
    map = _.extend(map, req.body);
    map.save();
    utils.jsonPage(res, {"status" : true, "id" : map.id});
}

/**
 * Show
 */

exports.json = function(req, res) {
    utils.jsonPage(res, {"status" : true, "data" : req.map});
}

/**
 * Delete an map
 */

exports.destroy = function(req, res) {
    var map = req.map
    map.remove(function(err){
        utils.jsonPage(res, {"status" : true});
    })
}

/**
 * Load
 */

exports.load = function(req, res, next, id){
    var User = mongoose.model('User')
    Map.load(id, function (err, map) {
        if (err) return next(err)
        if (!map) return next(new Error('not found'))
        req.map = map
        next()
    })
}