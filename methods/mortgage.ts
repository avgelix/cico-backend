
import { AmortizationMethod, Payment } from '../interfaces';

export class MortgageAmortization implements AmortizationMethod {

    public balance: number;     //The loan amount
    public periods: number;     //The total number of periods. (Ex: If 5 year term and payments are monthly then 60 periods)
    public periodicInterest: number;     //The interest payed per period, if the period is month then divide APR/12 (ex: APR = 3.5%, i = 0.035/12)
    public periodicPayment: number;     //The total payment that needs to be made per period.
    public schedule: Payment[];  //Array of payments required to pay off the balance. (Amortization Schedule)
    public totalPayment: number;     //The total of all payments over the term.
    public totalInterest: number;     //The total amount of interest spend over the term.
    public startDate?: Date;       //The start date of the loan.
    public endDate?: Date;       //The pay off date (Will only be calculated if startDate was given).

    /**
     * Creates a new Mortgage Amortization 
     * @param {number} balance          
     * @param {number} periodicInterest 
     * @param {number} periods          
     */
    constructor(balance: number,
        periodicInterest: number,
        periods: number,
        startDate: Date
    ) {

        this.balance = balance;
        this.periodicInterest = periodicInterest;
        this.periods = periods;
        this.startDate = startDate;
        this.periodicPayment = this.calculatePeriodicPaymentAmount();
        this.schedule = this.calculateSchedule();
        this.totalPayment = this.calculateTotalPayment();
        this.totalInterest = this.calculateTotalInterest();

    }

    /**
     * Calculates the periodic payment amount
     * @return {number}                  The total payment that needs to be made per period.
     */
    public calculatePeriodicPaymentAmount(): number {

        return this.balance * (this.periodicInterest + (this.periodicInterest / (Math.pow((1 + this.periodicInterest), this.periods) - 1)));

    }


    /**
     * Calculates the total payment amount over the term
     * @return {number}
     */
    public calculateTotalPayment(): number {

        return this.periods * this.periodicPayment;

    }

    /**
     * Calculates the total interest over the term
     * @return {number} 
     */
    public calculateTotalInterest(): number {

        return this.totalPayment - this.balance;

    }

    /**
     * Calculates Payment interest, principal, and remaining balance.
     * @param  {number}  balance           The remaining loan amount       
     * @return {Payment}                  
     */
    public calculatePayment(balance: number): Payment {

        let result = { interest: undefined, principal: undefined, remainingBalance: undefined } as Payment;

        result.interest = balance * this.periodicInterest;
        result.principal = this.periodicPayment - result.interest;

        if (balance < this.periodicPayment) {
            //If balance is less then periodicPayment we manually set 
            //remaining balance to 0 to minize rounding errors that could
            //cause the remaining balance to be slightly larger than 0.00
            result.remainingBalance = 0;
        }
        else {
            //Otherwise calculate remaining balance as normal.
            result.remainingBalance = balance - result.principal;
        }

        return result;

    }

    /**
     * Calculates the Amortization Schedule
     * If startDate was defined then it also calculates payment dates and date of payoff.
     * @return {Payment[]} 
     */
    public calculateSchedule(): Payment[] {

        let balance = this.balance;
        let result = [] as Payment[];

        //If startDate was defined we will attach dates to the payments and calculate endDate
        if (this.startDate) {
            this.endDate = new Date(this.startDate.toString());
        }

        //Calculate each payment until balance is paid off.
        while (balance > 0) {

            let payment = this.calculatePayment(balance);
            balance = payment.remainingBalance;

            if (this.endDate) {
                payment.date = new Date(this.endDate.toString());
                this.endDate.setMonth(this.endDate.getMonth() + 1);
            }

            result.push(payment);

        }

        return result;

    }

}