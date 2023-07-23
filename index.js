//express
var express = require('express')
var session = require('express-session')
var app = express()

//keycloak
const keycloak = require('./config/keycloak-config.js').initKeycloak();
const sessionSecret = require('./config/keycloak-config.js').sessionSecret;
const memoryStore = require('./config/keycloak-config.js').memoryStore;
const bodyParser = require('body-parser');
var port = 3000;
var cors = require('cors');


app.use((req, res, next) => {
    res.cookie('myCrossOriginCookie', 'crossOriginValue', {
      sameSite: 'None',
      secure: true,
      domain: 'localhost:8080', // Replace with your frontend domain
    });
    next();
  });

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Replace with the actual origin of your frontend application
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle the preflight OPTIONS request
    if (req.method === 'OPTIONS') {
      res.sendStatus(200); // Respond with HTTP 200 OK for OPTIONS requests
    } else {
      next();
    }
  });

app.use(bodyParser.json());

/*app.use(cors());*/
app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true,
    store: memoryStore,
    cookie: { secure: 'auto' } // "auto" will set Secure based on the request scheme (http/https)
}));

app.use(keycloak.middleware());
// app.use(keycloak.middleware({ logout: '/logoff' }));

//controller
var controller = require('./controller/controller.js');

app.use('/', controller);

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
});


/*app.use('*', (req, res) =>{
    res.send();
});*/