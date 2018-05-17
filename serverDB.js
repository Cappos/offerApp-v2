const express = require('express');
const models = require('./server/models');
const expressGraphQL = require('express-graphql');
const path = require('path');
const http = require('http');
const mongoose = require('mongoose');
const fs = require('fs');
const bodyParser = require('body-parser');
const schema = require('./server/schema/schema');
const multer = require('multer');
const userRoutes = require('./server/routes/user');
const uploadRoutes = require('./server/routes/upload');
const fileRoutes = require('./server/routes/file');
const pdfRoutes = require('./server/routes/pdf');
const uploadsDir = './uploads';
const tempDir = './uploads/temp';

const app = express();

// Replace with your mongoLab URI
const MONGO_URI = 'mongodb://127.0.0.1:27017/offers-management';
if (!MONGO_URI) {
    throw new Error('You must provide a MongoLab URI');
}

mongoose.Promise = global.Promise;
mongoose.connect(MONGO_URI);
mongoose.connection
    .once('open', () => console.log('Connected to MongoDB instance.'))
    .on('error', error => console.log('Error connecting to MongoDB:', error));


mongoose.set('debug', false);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use('/graphql', expressGraphQL({
    schema,
    graphiql: true
}));

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PATCH, DELETE, OPTIONS');
    next();
});

// Angular DIST output folder
app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.static(__dirname + '/'));


// Send all other requests to the Angular app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/index.html'));
});

// Create dir if not exist
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, '0777', true);
}
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, '0777', true);
    // copy pdf css file
    setTimeout(function () {
        fs.createReadStream('./scr/assets/css/pdf.css', 'utf8').pipe(fs.createWriteStream('./uploads/temp/pdf.css', 'utf8'));
    }, 500);
}



app.use('/user', userRoutes);
app.use('/upload', uploadRoutes);
app.use('/file', fileRoutes);
app.use('/pdf', pdfRoutes);


//Set Port
const port = process.env.PORT || '3000';
app.set('port', port);

const server = http.createServer(app);

server.listen(port, () => console.log(`Running on localhost:${port}`));


module.exports = app;