var mongoClient = require('mongodb').MongoClient,
    LOG = require('winston'),
    _ = require('underscore');

var database = null;

function init(url, callback) {
    mongoClient.connect(url, function (err, db) {
        if (err) {
            LOG.info('Error connecting to database');
            LOG.info(err);
            callback(err);
        }
        database = db;
        LOG.info('Database connection successful');
        callback();
    });
}

function getDB() {
    return database;
}

exports = _.extend(exports, {
    init: init,
    getDB: getDB
});