/**
 * Create user
 */

var mongoose = require('mongoose')
  , User = mongoose.model('User')
  , utils = require('../../lib/utils')

exports.create = function (req, res) {
    res.writeHead(200, {"Content-Type": "application/json"});
    var user = new User(req.body);
    user.provider = 'local';
    user.save(function (err) {
        if (err) {
            res.write(JSON.stringify(
                {"status":false, "errors" : utils.errors(err.errors)}));
            res.end();
            return;
        } else {
            res.write(JSON.stringify({"status":true}));
            res.end();
        }
    });
};