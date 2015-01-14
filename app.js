var express = require('express'),
    async = require('async'),
    _ = require('underscore'),
    util = require('util'),
    session = require('express-session'),
    LOG = require('winston'),
    mailer = require('./mailer.js'),
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
            "initMailer": mailer.init,
            "mountAPI": self.mountAPI.bind(self)
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
    this.app.post('/restricted/loginWithPassword', api.loginWithPassword);
    cb();
};

Application.prototype.connectToDb = function (cb) {
    dao.init(this.app.customConfiguration.dbURL, cb);
};

Application.prototype.configure = function (cb) {
//Configuration for errorHandler and others.
    var self = this;

    //TODO: this should be replaced to somehting like Redis/Memcached storage to achieve proper multi=node work.
    self.app.use(session({
        secret: "hi I'm a secret"
    }));

    self.app.use("/restricted/", function (req, res, next) {
        if(!(
            req.originalUrl === '/restricted/static/login.html'
            || req.originalUrl === '/restricted/loginWithPassword'
            )
            && !req.session.isAllowed) {
            return res.redirect(302, "/restricted/static/login.html")
        }
        LOG.info(util.format('Logged in middleware. Url is %s', req.originalUrl));
        next();
    });

    self.app.use("/restricted/static", express.static(__dirname + '/static'));
    self.app.use(express.bodyParser());


    self.app.customConfiguration = {
        dbURL: process.env.MONGOLAB_URI || "mongodb://localhost/cvtracker"
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