var express = require('express');
var router = express.Router();
var Calculator = require('../dist/node/calculator').Calculator;
const pool = require('../database/mysql'); // Import the database connection pool from mysql.js
const keycloak = require('../config/keycloak-config.js').getKeycloak();

router.get('/getCico', function (req, res) {
    res.send('Server is up!');
})

router.get('/service/public', function (req, res) {
    if(req?.kauth?.grant?.access_token?.content?.given_name && req?.kauth?.grant?.access_token?.content?.family_name){
      res.json({message: `Hi ${req?.kauth?.grant?.access_token?.content?.given_name} ${req?.kauth?.grant?.access_token?.content?.family_name}`});
    }
    else {
      res.status(500).json({});
    }
  });
  
router.get('/service/secured', keycloak.protect('realm:app-user'), function (req, res) {
    res.json({message: `Hi user ${req.kauth.grant.access_token.content.given_name} ${req.kauth.grant.access_token.content.family_name}`});
});
  
router.get('/service/admin', keycloak.protect('realm:app-admin'), function (req, res) {
    res.json({message: `Hi admin ${req.kauth.grant.access_token.content.given_name} ${req.kauth.grant.access_token.content.family_name}`});
});

router.post('/service/createLoan', keycloak.protect(), (req, res) => {
  const { balance, monthlyPayment, apr, date } = req.body;
  const response = Calculator.calculate({
      method: 'mortgage',
      apr: apr, //TODO controlla come calcoli l'apr (attenzione al modo in cui il codice calcola periodicInterest)
      balance: balance,
      loanTerm: Math.ceil(balance / monthlyPayment),
      startDate: date,
  });
  res.status(200).json({ message: 'Loan created successfully', response });
})

///Route to handle user login and store user info in the database
router.post('/service/public', keycloak.protect(), async (req, res) => {
  try {
    console.log('a good start');
    if (req?.kauth?.grant?.access_token?.content?.given_name && req?.kauth?.grant?.access_token?.content?.family_name) {
      const username = req.kauth.grant.access_token.content.preferred_username;
      const fullName = `${req.kauth.grant.access_token.content.given_name} ${req.kauth.grant.access_token.content.family_name}`;
      const sub = req.kauth.grant.access_token.content.sub; // Get the "sub" value from the access token
  
      // Check if the user already exists in the database based on the Keycloak 'sub'
      const existingUser = await pool.query('SELECT user_id FROM Users WHERE username = ?', [sub]);
  
      if (existingUser.length > 0) {
        // If the user already exists, retrieve the user_id from the database
        const user_id = existingUser[0].user_id;
        res.json({ user_id, message: 'User logged in.' });
        console.log('existing user logged in');
      } else {
        // If the user does not exist, insert the user into the database with the "sub" as the user_id
        const [insertResult] = await pool.query('INSERT INTO Users (user_id, username, full_name) VALUES (?, ?, ?)', [sub, username, fullName]);
        const user_id = insertResult.insertId;
        res.json({ user_id, message: 'User registered and logged in.' });
        console.log('new user logged in');
      }
    } else {
      res.status(500).json({});
    }
  } catch (error) {
    console.error('Error storing user info:', error);
    res.status(500).json({});
  }
});

module.exports = router;


