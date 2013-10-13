
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
