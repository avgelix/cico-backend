export interface Payment {

    interest: number; //Portion of the payment that goes to interest.
    principal: number; //Portion of the payment that goes to principal.
    remainingBalance: number; //Remaining balance after this payment.
    date: Date;   //The date of the payment.

}


export interface AmortizationMethod {

    balance: number;     //The loan amount
    periods: number;     //The total number of periods. (Ex: If 5 year term and payments are monthly then 60 periods)
    periodicInterest: number;     //The interest payed per period, if the period is month then divide APR/12 (ex: APR = 3.5%, i = 0.035/12)
    periodicPayment: number;     //The total payment that needs to be made per period.
    schedule: Payment[];  //Array of payments required to pay off the balance. (Amortization Schedule)
    totalPayment: number;     //The total of all payments over the term.
    totalInterest: number;     //The total amount of interest spend over the term.
    startDate?: Date;       //The start date of the loan.
    endDate?: Date;       //The pay off date (Will only be calculated if startDate was given).

}


export interface calculatorConfig {

    method: string | Function; //A string identifying the amortization method to use, or a custom amortization function. See Calculator.availableMethods()
    balance: number; //The loan amount.
    loanTerm: number; //Loan term in month.
    apr: number; //The Anual Percentage Rate (ex: 3.5%)
    startDate?: Date;   //Optional start date, will cause monthly payments to have dates attached to them.

}