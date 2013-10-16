
/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
var auth = require('./middlewares/authorization')

var passportOptions = {
    failureFlash: 'Invalid email or password.',
    failureRedirect: '/login'
}

// controllers
var home = require('home')
var map = require('map')
var users = require('users')


/**
 * Route middlewares
 */

var mapAuth = [auth.requiresLogin, auth.map.hasAuthorization]


/**
 * Expose
 */

module.exports = function (app, passport) {

    app.get('/', home.index)
    app.post('/users/', users.create)
    app.post('/users/session', passport.authenticate('local'), users.session)

    app.get('/map/', map.index)
    app.get('/map/list/', auth.requiresLogin, map.list)

    app.get('/map/:id', mapAuth, map.show)
    app.put('/map/:id', mapAuth, map.update)
    app.del('/map/:id', mapAuth, map.destroy)
    app.post('/map/', auth.requiresLogin, map.create)
    app.param('id', map.load)

}