var express = require('express');
var router = express.Router();
var Calculator = require('../dist/node/calculator').Calculator;
const keycloak = require('../config/keycloak-config.js').getKeycloak();

router.get('/getCico', function (req, res) {
    res.send('Server is up!');
})

router.post('/createLoan', (req, res) => {
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
  
module.exports = router;


