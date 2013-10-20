/**
 * Create user
 */

var mongoose = require('mongoose')
  , User = mongoose.model('User')
  , utils = require('../../lib/utils')

exports.create = function (req, res) {
    var user = new User(req.body);
    user.provider = 'local';
    user.save(function (err) {
        if (err) {
            utils.jsonPage(res,
                {"status":false, "errors" : utils.errors(err.errors)});
        } else {
            utils.jsonPage(res, {"status":true});
        }
    });
};

exports.session = function(req, res) {
    utils.jsonPage(res, {"status":true, "user":req.user.name});
}

exports.logout = function(req, res) {
    req.logout();
    res.redirect('/map/')
}