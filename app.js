var express = require('express'),
    async = require('async'),
    _ = require('underscore'),
    LOG = require('winston'),
    api = require('./api.js'),
    path = require('path'),
    dao = require('./dao.js');


function Application() {
    this.app = express();
}

Application.prototype.init = function (cb) {
    var self = this;

    async.series({
            "configure": self.configure.bind(self),
            "connectToDb": self.connectToDb.bind(self),
            "mountAPI": self.mountAPI.bind(self),
        },
        function (err, callback) {
            if (err) {
                LOG.info('Error starting up the application. Exiting.');
                LOG.info(err);
                process.exit(1);
            }
            if (cb) {
                cb(err);
            }
        })
};


Application.prototype.mountAPI = function (cb) {
    this.app.get('/:clientId/:version/Alexander.Cherednichenko.CV.pdf', api.serveCVAndTrack);
    this.app.post('/restricted/saveNewClient', api.saveNewClient);
    this.app.get('/restricted/getAllJobs', api.getAllJobs);
    cb();
};

Application.prototype.connectToDb = function (cb) {
    dao.init(this.app.customConfiguration.dbURL, cb);
};

Application.prototype.configure = function (cb) {
//Configuration for errorHandler and others.
    var self = this;

    self.app.use("/restricted/static", express.static(__dirname + '/static'));
    self.app.use(express.json());


    self.app.customConfiguration = {
        dbURL: "mongodb://localhost/cvtracker"
    };

    cb();
};

Application.prototype.start = function (cb) {
    // Binding to port provided by Heroku, or to the default one.
    var portToListenTo = process.env.PORT || 3000;
    this.app.listen(portToListenTo, function (err, server) {
        LOG.info('Application started on ULR http://localhost:' + portToListenTo);
        if (cb) {
            cb(err);
        }
    });

};


module.exports = Application;