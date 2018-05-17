const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const mime = require('mime');
const dir = require('node-dir');

const walkSync = (dir, filelist = []) => {
    fs.readdirSync(dir).forEach(file => {
        filelist = fs.statSync(path.join(dir, file)).isDirectory()
            ? walkSync(path.join(dir, file), filelist)
            : filelist.concat({
                name: file,
                path: `${dir}/${file}`,
                size: fs.statSync(path.join(dir, file)).size,
                type: mime.lookup(file)
            });
    });
    return filelist;
};

dir.readFiles(__dirname,
    function(err, content, next) {
        if (err) throw err;
        console.log('content:', content);
        next();
    },
    function(err, files){
        if (err) throw err;
        console.log('finished reading files:', files);
    });

router.post('/', function (req, res, next) {
    const filest = walkSync('uploads');


    res.status(200).json({
        message: 'Successfully get filest',
        files: filest
    });
});

module.exports = router;