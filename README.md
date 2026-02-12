# Bank Project

Banking application backend with Node.js, Express.js, and MongoDB. Features user authentication, account management, and double-entry ledger system.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Environment Setup](#environment-variables)
- [Running](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Banking Ledger System](#banking-ledger-system)

## Features

- User registration and login with JWT
- Multiple bank accounts
- Deposits, withdrawals, transfers
- Double-entry ledger system
- Email notifications
- Immutable transaction records
- Password hashing with bcryptjs

## Tech Stack

- **Framework**: Express.js 5.2.1
- **Database**: MongoDB with Mongoose 9.2.0
- **Auth**: JWT 9.0.3, BCryptJS 3.0.3
- **Email**: Nodemailer 8.0.1
- **Runtime**: Node.js

## Installation

```bash
git clone <repository-url>
cd bank-project
npm install
```

## Environment Variables

Create `.env` file:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/bank-project
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=7d
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

## Running the Application

```bash
# Development
npm run dev

# Production
npm start
```

Server runs on `http://localhost:3000`

## API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint    | Auth |
| ------ | ----------- | ---- |
| POST   | `/register` | No   |
| POST   | `/login`    | No   |
| POST   | `/logout`   | Yes  |

### Accounts (`/api/accounts`)

| Method | Endpoint              | Auth |
| ------ | --------------------- | ---- |
| POST   | `/`                   | Yes  |
| GET    | `/`                   | Yes  |
| GET    | `/balance/:accountId` | Yes  |

### Transactions (`/api/transactions`)

| Method | Endpoint                | Auth |
| ------ | ----------------------- | ---- |
| POST   | `/`                     | Yes  |
| POST   | `/system/initial-funds` | Yes  |

## Database Models

- **User**: Email, password hash
- **Account**: Account number, type, balance, holder, status
- **Transaction**: Type, amount, source, destination, timestamp, status
- **Ledger**: Account, transaction, amount, type (DEBIT/CREDIT), timestamp (immutable)
- **Blacklist**: Invalidated JWT tokens

## Banking Ledger System

Double-entry bookkeeping system for financial record-keeping and transaction tracking.

### How It Works

Every transaction creates ledger entries:

**Transfer $100 from Account A to Account B:**

- Account A: DEBIT $100 (outflow)
- Account B: CREDIT $100 (inflow)

**Balance Formula:**

```
Balance = Initial Balance + Total Credits - Total Debits
```

### Key Features

- **Immutable**: Cannot be modified or deleted (prevents fraud)
- **Linked**: Each entry references its transaction
- **Timestamped**: Maintains transaction sequence
- **Auditable**: Complete history of all movements

### Access Transactions

```bash
POST /api/transactions/                    # Create transaction
POST /api/transactions/system/initial-funds # Add initial funds
GET /api/accounts/balance/:accountId        # Check account balance
```

## Security

- Passwords hashed with bcryptjs
- JWT token-based authentication
- Immutable ledger entries
- Token blacklist for logout
- Auth middleware on protected routes

## License

ISC License
