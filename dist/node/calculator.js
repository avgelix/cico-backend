"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Calculator = void 0;
const mortgage_1 = require("./methods/mortgage");
class Calculator {
    /**
     * Calculates an amortization schedule.
     * @param {calculatorConfig} config
     */
    static calculate(config) {
        let method = undefined;
        //Pick from integrated amortization methods.
        if (typeof config.method === 'string') {
            switch (config.method) {
                case 'mortgage':
                default:
                    method = mortgage_1.MortgageAmortization;
                    break;
            }
        }
        //Use custom method
        else if (typeof config.method === 'function') {
            method = config.method;
        }
        //Turn APR into periodic interest
        let periodicInterest = (config.apr / 100) / 12;
        //Return the amortization
        return new method(config.balance, periodicInterest, config.loanTerm, config.startDate);
    }
    /**
     * Returns the amortization methods that are available.
     * @return {string[]} List of amortization methods.
     */
    static availableMethods() {
        return [
            'mortgage'
        ];
    }
}
exports.Calculator = Calculator;
//If module is used in browser we attach it to the window.
if (typeof window !== 'undefined') {
    window.AmortizeJS = Calculator;
}
