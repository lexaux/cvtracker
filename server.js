var async = require("async"),
    app = require('./app.js'),
    LOG = require('winston');

LOG.info('About to start cvtracker application...');

var myApp = new app();

async.series([
    myApp.init.bind(myApp),
    myApp.start.bind(myApp)
], function(err, cb) {
   LOG.info('Started app successfully.')
});


