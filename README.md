# CICO Backend

A RESTful API backend service for calculating mortgage loan amortization schedules. This service provides endpoints for creating and managing loan calculations with detailed payment schedules.

## About the Project

CICO Backend is a Node.js-based API server that specializes in financial calculations, specifically mortgage amortization. The system calculates detailed loan repayment schedules including monthly payments, interest breakdowns, principal payments, and remaining balances over the life of a loan.

### Key Features

- **Mortgage Amortization Calculations**: Calculate complete loan amortization schedules
- **Flexible Loan Terms**: Support for custom loan amounts, APR rates, and payment terms
- **Payment Scheduling**: Generate detailed payment schedules with dates
- **RESTful API**: Easy-to-use HTTP endpoints for loan calculations
- **CORS Support**: Cross-origin resource sharing enabled for frontend integration

## Technologies Used

### Core Technologies

- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework for building the REST API
- **TypeScript**: Typed superset of JavaScript for enhanced code quality and maintainability

### Database

- **MySQL**: Relational database for data persistence

### Development Tools

- **Nodemon**: Development tool for auto-reloading the server on file changes
- **Body-parser**: Middleware for parsing incoming request bodies

## Project Structure

```
cico-backend/
├── calculator.ts          # Main calculator class for amortization
├── interfaces.ts          # TypeScript interfaces and type definitions
├── index.js              # Express server entry point
├── controller/
│   └── controller.js     # API route handlers
├── methods/
│   └── mortgage.ts       # Mortgage amortization implementation
├── db/
│   └── mysql.js          # MySQL database configuration
├── dist/                 # Compiled TypeScript output
└── package.json          # Project dependencies and scripts
```

## API Endpoints

### GET `/dummy-backend/getCico`

Health check endpoint to verify the server is running.

**Response:**
```
Server is up!
```

### POST `/dummy-backend/createLoan`

Creates a loan amortization schedule based on the provided parameters.

**Request Body:**
```json
{
  "balance": 100000,
  "monthlyPayment": 1000,
  "apr": 3.5,
  "date": "2024-01-01"
}
```

**Parameters:**
- `balance` (number): The total loan amount
- `monthlyPayment` (number): Desired monthly payment amount
- `apr` (number): Annual Percentage Rate (e.g., 3.5 for 3.5%)
- `date` (string): Start date of the loan

**Response:**
```json
{
  "message": "Loan created successfully",
  "response": {
    "balance": 100000,
    "periods": 100,
    "periodicInterest": 0.00291667,
    "periodicPayment": 1000,
    "schedule": [...],
    "totalPayment": 100000,
    "totalInterest": 0,
    "startDate": "2024-01-01",
    "endDate": "2032-05-01"
  }
}
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/avgelix/cico-backend.git
cd cico-backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure MySQL database:
   - Update the database credentials in `db/mysql.js`
   - Set your MySQL host, username, password, and database name

4. Compile TypeScript code:
```bash
npx tsc
```

## Usage

### Development Mode

Run the server with auto-reload on file changes:
```bash
npm run dev
```

### Production Mode

Start the server:
```bash
node index.js
```

The server will start on port 3000 by default.

## Configuration

### Database Configuration

Edit `db/mysql.js` to configure your MySQL connection:
```javascript
const pool = mysql.createPool({
    host: 'localhost',
    user: 'your_username',
    password: 'your_password',
    database: 'your_database_name'
});
```

### Server Port

The default port is 3000. You can modify it in `index.js`:
```javascript
var port = 3000;
```

## Amortization Calculation

The system uses standard mortgage amortization formulas to calculate:

- **Periodic Payment**: `M = P * (i + (i / ((1 + i)^n - 1)))`
  - M = Monthly payment
  - P = Principal (loan balance)
  - i = Periodic interest rate (APR / 12)
  - n = Number of periods

- **Interest Portion**: Calculated as the remaining balance multiplied by the periodic interest rate
- **Principal Portion**: Monthly payment minus the interest portion
- **Remaining Balance**: Previous balance minus the principal portion

## CORS Configuration

The API is configured to accept requests from any origin with the following methods:
- GET
- POST
- OPTIONS

Headers allowed: `Content-Type`

## License

ISC

## Author

avgelix
