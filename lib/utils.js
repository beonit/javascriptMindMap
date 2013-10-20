
/**
 * Formats mongoose errors into proper array
 *
 * @param {Array} errors
 * @return {Array}
 * @api public
 */

exports.errors = function (errors) {
  var keys = Object.keys(errors)
  var errs = []

  // if there is no validation error, just display a generic error
  if (!keys) {
    console.log(errors);
    return ['Oops! There was an error']
  }

  keys.forEach(function (key) {
    errs.push(errors[key].type)
  })

  return errs
}

exports.jsonPage = function(res, obj) {
  res.writeHead(200, {"Content-Type": "application/json"});
  res.write(JSON.stringify(obj));
  res.end();
}

exports.sessionState = function(req) {
  if(req.user)
    return true;
  else
    return false;
}
