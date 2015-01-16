var express = require('express'),
    async = require('async'),
    _ = require('underscore'),
    LOG = require('winston'),
    util = require('util'),
    sendgridAPI = require('sendgrid');

var NOTIFICATION_EMAIL = "lexaux@gmail.com";
var NOTIFICATION_FROM = "robot@cherednichenko.info";
var sendgrid = null;

var mailer = {
    sendNotification: function (client, cb) {
        if (!sendgrid) {
            LOG.info('No sendgrid configuration, skipping email.');
            return cb();
        }
        // prepare text
        sendgrid.send({
            to: NOTIFICATION_EMAIL,
            from: NOTIFICATION_FROM,
            subject: util.format("CV view by %s for position %s", client.employerName, client.jobName),
            text: util.format('Your CV has been viewed! Url is %s', client.jobURL)
        }, cb);
    },

    init: function (callback) {
        var apiUser = process.env.SENDGRID_USERNAME;
        var apiPassword = process.env.SENDGRID_PASSWORD;
        if (!apiUser || !apiPassword) {
            LOG.info('Initializing without a mailer');
            return callback();
        }
        sendgrid = sendgridAPI(apiUser, apiPassword);
        LOG.info('Mailer initialized successfully.');
        return callback();
    }
}

exports = _.extend(exports, mailer);