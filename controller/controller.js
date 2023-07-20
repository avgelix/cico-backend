var express = require('express');
var router = express.Router();
var Calculator = require('../dist/node/calculator').Calculator;

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

module.exports = router;