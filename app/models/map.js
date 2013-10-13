var mongoose = require('mongoose')
var Schema = mongoose.Schema

/**
 * Map data scheme
 */

var MapSchema = new Schema({
    map : {type : String, default : '', trim : true},
    title: {type : String, default : '', trim : true},
    user: {type : Schema.ObjectId, ref : 'User'},
    createdAt    : {type : Date, default : Date.now}
})

/**
 * Validations
 */

MapSchema.path('map').validate(function (map) {
    return map.length > 0
}, 'Map map data cannot be blank')

MapSchema.path('title').validate(function (title) {
    return title.length > 0
}, 'Article title cannot be blank')

/**
 * Methods
 */

MapSchema.methods = {

}

/**
 * Statics
 */

MapSchema.statics = {

    /**
     * Find article by id
     *
     * @param {ObjectId} id
     * @param {Function} cb
     * @api private
     */

    load: function (id, cb) {
        this.findOne({ _id : id })
            .populate('user', 'name email username')
            .populate('comments.user')
            .exec(cb)
    },

    /**
     * List articles
     *
     * @param {Object} options
     * @param {Function} cb
     * @api private
     */

    list: function (options, cb) {
        var criteria = options.criteria || {}

        this.find(criteria)
            .populate('user', 'name username')
            .sort({'createdAt': -1}) // sort by date
            .limit(options.perPage)
            .skip(options.perPage * options.page)
            .exec(cb)
    }

}

mongoose.model('Map', MapSchema)
