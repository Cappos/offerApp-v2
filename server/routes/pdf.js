const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const createHTML = require('create-html');
const pdf = require('html-pdf');
const bodyParser = require('body-parser').json();
const decode = require('unescape');
const dir = './uploads/temp';


// Set image path for pdf
let assetsPath = path.join(__dirname + '/../../src/');
assetsPath = assetsPath.replace(new RegExp(/\\/g), '/');


// set PDF options
const options = {
    format: 'A4',
    // width: '280mm',
    // height: '396mm',
    quality: "100",
    dpi: 96,
    border: {
        top: "1cm",
        bottom: "1cm"
    },
    base: "file:///" + assetsPath
};

const style = fs.readFileSync('./src/pdf.css', 'utf8'); // get css for pdf html template

router.post('/', bodyParser, function (req, res, next) {
    // Create dir if not exist
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }

    // Create HTML template file
    const html = createHTML({
        title: 'PDF',
        body: decode(req.body.data), // append html from request
        head: '<link href="https://fonts.googleapis.com/css?family=Roboto:300,400,400i,700,900" rel="stylesheet">' +
        '<style>' + style + '</style>' // add css to html
    });

    fs.writeFile('./uploads/temp/pdf.html', html, function (err, file) {
        if (err) {
            return file.status(500).json({
                title: 'An error occurred on HTML file create',
                error: err
            });
        }

        const html = fs.readFileSync('./uploads/temp/pdf.html', 'utf8'); // get html file content

        // Create PDF from HTML file
        pdf.create(html, options).toFile('./uploads/temp/offer.pdf', function (err, pdf) {
            if (err) {
                return file.status(500).json({
                    title: 'An error occurred on pdf create',
                    error: err
                });
            }

            let file = './uploads/temp/offer.pdf'; // Set download PDF location

            // Download file
            res.download(file, 'offer.pdf', function (err) {
                if (err) {
                    return file.status(500).json({
                        title: 'An error occurred on file download',
                        error: err
                    });
                }

                // Delete files if download success
                fs.unlinkSync('./uploads/temp/pdf.html');
                fs.unlinkSync('./uploads/temp/offer.pdf');
            });
        });
    });
});

module.exports = router;