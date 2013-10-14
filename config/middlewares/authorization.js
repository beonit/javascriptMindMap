
/*
 *  Generic require login routing middleware
 */

exports.requiresLogin = function (req, res, next) {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl
        res.writeHead(200, {"Content-Type": "application/json"});
        res.write(JSON.stringify({"status":false, errors:["Auth fail"]}));
        res.end();
        return res;
    }
    next()
}

/*
 *  Map authorization routing middleware
 */

exports.map = {
    hasAuthorization : function (req, res, next) {
        if (req.map.user.id != req.user.id) {
            req.flash('info', 'You are not authorized')
            return res.redirect('/map/'+req.article.id)
        }
        next()
    }
}
