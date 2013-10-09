
/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
var passportOptions = {
  failureFlash: 'Invalid email or password.',
  failureRedirect: '/login'
}

// controllers
var home = require('home')
var map = require('map')
var users = require('users')

/**
 * Expose
 */

module.exports = function (app, passport) {

  app.get('/', home.index)
  app.get('/map/', map.index)
  app.post('/users/', users.create)

}
