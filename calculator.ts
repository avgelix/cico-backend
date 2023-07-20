import { MortgageAmortization } from './methods/mortgage';
import { calculatorConfig, AmortizationMethod } from './interfaces';

export abstract class Calculator {

    /**
     * Calculates an amortization schedule.
     * @param {calculatorConfig} config 
     */
    static calculate(config: calculatorConfig) {

        let method = undefined;

        //Pick from integrated amortization methods.
        if (typeof config.method === 'string') {

            switch (config.method) {
                case 'mortgage':
                default:
                    method = MortgageAmortization;
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
    static availableMethods(): string[] {

        return [
            'mortgage'
        ]

    }


}

//If module is used in browser we attach it to the window.
if (typeof window !== 'undefined') {
    (window as any).AmortizeJS = Calculator;
}

