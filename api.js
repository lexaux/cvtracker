var _ = require('underscore'),
    LOG = require('winston'),
    path = require('path'),
    uuid = require('uuid'),
    mailer = require('./mailer.js'),
    async = require('async'),
    validator = require('validator'),
    util = require('util'),
    dao = require('./dao.js');


var FILENAME = 'Alexander.Cherednichenko.CV.pdf';

var api = {
    serveCVAndTrack: function (req, res) {

        LOG.info(util.format('Downloading file for %s!', req.params.clientId));
        var jobId = req.params.clientId;

        async.parallel(
            [
                function (cb) {
                    dao.getDB().collection('access_log', function (err, accessLog) {
                        if (err) {
                            LOG.info(err);
                            LOG.info('Error accessing database');
                            cb(err);
                        }
                        accessLog.insert({
                            'customerId': jobId,
                            'timestamp': new Date()
                        }, cb);
                    })
                },
                function (cb) {
                    dao.getDB().collection('job', function (err, jobs) {
                        jobs.update(
                            {
                                uuid: jobId
                            },
                            {
                                $currentDate: {timestamp: {$type: "date"}},
                                $inc: {"actionCount": 1}
                            },
                            cb);
                    });

                },
                function (cb) {
                    dao.getDB().collection('job', function (err, jobs) {
                        if (err) {
                            cb(err);
                        }
                        jobs.findOne({uuid: jobId}, function (err, job) {
                            if (err) {
                                cb(err);
                            }
                            mailer.sendNotification(job, cb);
                        });
                    })
                }
            ],
            function (err) {
                if (err) {
                    LOG.info(err);
                    LOG.info('Will still download the file though.')
                }
                var file = path.join(__dirname, FILENAME);
                res.download(file, FILENAME);
            });
    },

    saveNewClient: function (req, res) {
        var jobFromClient = req.body;
        var correct =
            validator.isLength(jobFromClient.employerName, 0) &&
                validator.isLength(jobFromClient.jobName, 0) &&
                validator.isURL(jobFromClient.jobURL);
        if (!correct) {
            LOG.info('Wrong data format.');
            res.status(400);
            res.end();
            return;
        }

        var jobToSave = {
            employerName: validator.toString(jobFromClient.employerName),
            jobName: validator.toString(jobFromClient.jobName),
            jobURL: validator.toString(jobFromClient.jobURL),
            uuid: uuid.v4(),
            timestamp: new Date()
        };

        dao.getDB().collection('job', function (err, coll) {
            if (err) {
                LOG.info('Error saving job');
                LOG.info(err);

                res.status(400);
                return res.end();
            }
            coll.insert(jobToSave, function (err) {

                if (err) {
                    LOG.info('Error saving job');
                    LOG.info(err);

                    res.status(400);
                    return res.end();
                }
                res.send(jobToSave.uuid);
            });
        });
    },


    getAllJobs: function (req, res) {
        dao.getDB().collection('job', function (err, jobs) {
            if (err) {
                LOG.info(err);
                res.status(400);
                return res.end();
            }
            jobs.find(

                {},

                {_id: 0},

                {
                    sort: [
                        ["timestamp", "desc"]
                    ]
                }).toArray(function (err, results) {
                    if (err) {
                        LOG.info(err);
                        res.status(400);
                        return res.end();
                    }
                    res.send(results);
                });
        });
    },


    loginWithPassword: function (req, res) {
        if (req.body.secret === 'HiMumSaidDad') {
            req.session.isAllowed = true;
            return res.redirect('/restricted/static');
        }
        res.status(400);
        return res.send('Wrong password');
    }
};

exports = _.extend(exports, api);