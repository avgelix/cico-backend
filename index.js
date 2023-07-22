var express = require('express')
var app = express()

var controller = require('./controller/controller.js');
const bodyParser = require('body-parser');
var port = 3000;

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
});

// Add a middleware to set the appropriate CORS headers
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
  });

app.use(bodyParser.json());
app.use('/dummy-backend', controller);