const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');



/** API path that will upload the files */
router.post('/', function (req, res, next) {

    // File upload
    let storage = multer.diskStorage({ //multers disk storage settings
        destination: function (req, file, cb) {
            cb(null, './uploads/');
        },
        filename: function (req, file, cb) {
            let datetimestamp = Date.now();
            cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1]);
        },
    });

    let upload = multer({ //multer settings for single upload
        storage: storage
    }).single('file');

    upload(req, res, function (err) {
        if (err) {
            res.json({error_code: 1, err_desc: err});
            return;
        }

        res.send(req.file);
    });

});

router.post('/graph', function (req, res, next) {

    // File upload
    let storage = multer.diskStorage({ //multers disk storage settings
        destination: function (req, file, cb) {
            cb(null, './src/assets/images/');
        },
        filename: function (req, file, cb) {
            let datetimestamp = Date.now();
            cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1]);
        },
    });

    let upload = multer({ //multer settings for single upload
        storage: storage
    }).single('file');

    upload(req, res, function (err) {
        if (err) {
            res.json({error_code: 1, err_desc: err});
            return;
        }

        res.send(req.file);
    });

});

module.exports = router;