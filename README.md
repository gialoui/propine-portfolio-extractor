# Propine Portfolio Helper

## What is it?
Basically, this mini project is a CLI tool written in NodeJS to extract portfolio data from the transactions CSV log file. The CSV should have the following format columns:
- timestamp: Integer number of seconds since the Epoch
- transaction_type: Either a DEPOSIT or a WITHDRAWAL
- token: The token symbol
- amount: The amount transacted

### What were considered during the development process?
- Put in use `big.js` library to contain the precision that Bitcoin value may offer.
- In order to process a large file, I chose to use Node.js stream to make it possible to read the whole data in smaller chunks continuously without keeping it all in memory.
- API Key is passed through Headers instead of URL parameters (although it's an option in Cryptocompare API) to make the key less visible from the outsiders.

## Prerequisites
- Node.js v18+
- Yarn

### Node.js
Download and install from this [link](https://nodejs.org/en/download)

### Yarn
Once you have npm installed, you can run the following command:
```
npm install --global yarn
```
## Running the application
### Replace empty values in `.env` file with your own

### Run this command one time when you first checkout the repository:
```
yarn
```

### Run this command when you want to re-compile the project:
```
yarn build
```

### After finishing the build, you can run this command to get the instructions
```
node dist/index.js --dir <pathToTransactionsLog> --help
```

## What to improve?
- Write Unit tests
- Add support for multiple tokens parameter