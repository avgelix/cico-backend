var express = require('express');
var router = express.Router();
var Calculator = require('../dist/node/calculator').Calculator;
const pool = require('../database/mysql'); // Import the database connection pool from mysql.js
const keycloak = require('../config/keycloak-config.js').getKeycloak();

router.get('/getCico', function (req, res) {
    res.send('Server is up!');
});

router.post('/service/createAmor', (req, res) => {
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


// Route to handle loan creation
router.post('/service/newLoan', async (req, res) => {
  try {
    const { loan_amount, annual_interest, lender_name, lendee_name, amortization_data, } = req.body;

    const amortizationDataString = JSON.stringify(amortization_data);

    // Retrieve the lender_user_id from the Users table based on the lender_name
    const [lenderResult] = await pool.query('SELECT user_id FROM Users WHERE full_name = ?', [lender_name]);
    const lender_user_id = lenderResult[0]?.user_id || null; // Use null if the lender_name is not found in the Users table

    // Retrieve the lendee_user_id from the Users table based on the lendee_name
    const [lendeeResult] = await pool.query('SELECT user_id FROM Users WHERE full_name = ?', [lendee_name]);
    const lendee_user_id = lendeeResult[0]?.user_id || null; // Use null if the lendee_name is not found in the Users table

    // Insert the loan details into the Loans table
    const [insertResult] = await pool.query(
      'INSERT INTO Loans (loan_amount, annual_interest, lender_user_id, lendee_user_id, amortization_data) VALUES (?, ?, ?, ?, ?)',
      [loan_amount, annual_interest, lender_user_id, lendee_user_id, amortizationDataString]
    );

    // Retrieve the auto-generated loan_id from the insert result
    const loan_id = insertResult.insertId;

    res.status(200).json({ loan_id, message: 'Loan created successfully' });
  } catch (error) {
    console.error('Error creating loan:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/service/lenderLoans', keycloak.protect(), async (req, res) => {
  try {
    console.log('lets do this');
    const user_id = req.kauth.grant.access_token.content.sub; // Assuming the user_id is stored in the access token
    console.log(user_id);

    // Fetch loans from the database based on the lender_user_id and join with Users table to get lendee's full name
    const query = `
      SELECT l.*, u.full_name as lendee_full_name
      FROM Loans l
      JOIN Users u ON l.lendee_user_id = u.user_id
      WHERE l.lender_user_id = ?`;

    const [loans] = await pool.query(query, [user_id]);

    console.log(loans);
    res.json({ loans });

  } catch (error) {
    console.error('Error fetching loans:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});


router.get('/service/lendeeLoans', keycloak.protect(), async (req, res) => {
  try {
    console.log('lets do this');
    const user_id = req.kauth.grant.access_token.content.sub; // Assuming the user_id is stored in the access token
    console.log(user_id);

    // Fetch loans from the database based on the lendee_user_id and join with Users table to get lender's full name
    const query = `
      SELECT l.*, u.full_name as lender_full_name
      FROM Loans l
      JOIN Users u ON l.lender_user_id = u.user_id
      WHERE l.lendee_user_id = ?`;

    const [loans] = await pool.query(query, [user_id]);

    console.log(loans);
    res.json({ loans });

  } catch (error) {
    console.error('Error fetching loans:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});


// Route to handle payment creation
router.post('/service/newPayment', async (req, res) => {
  try {
    const { loan_id, payment_amount, payment_date, payment_method, payment_notes, amortization_data, } = req.body;

    const amortizationDataString = JSON.stringify(amortization_data);

    // Insert the payment details into the PaymentHistory table
    const [insertResult] = await pool.query(
      'INSERT INTO PaymentHistory (loan_id, payment_amount,payment_date, payment_method, payment_notes, amortization_data) VALUES (?, ?, ?, ?, ?, ?)',
      [loan_id, payment_amount, payment_date, payment_method, payment_notes, amortizationDataString]
    );

    // Retrieve the auto-generated loan_id from the insert result
    const payment_id = insertResult.insertId;

    res.status(200).json({ payment_id, message: 'Payment created successfully' });
  } catch (error) {
    console.error('Error recording payment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});




module.exports = router;


