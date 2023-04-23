import Big from 'big.js';
import { Command } from 'commander';
import csvParser from 'csv-parser';
import { config } from 'dotenv';
import * as figlet from 'figlet';
import * as fs from "fs";
import * as path from "path";
import { getCurrentPrice } from './client/cryptocompare';
import { Transaction } from './dao/transaction';

// Load environment variables from .env file
config();

const program = new Command();
console.log(figlet.textSync("Propine Helper"));

program
  .version("1.0.0")
  .description("CLI application aims to compute the portfolio of crypto investor based on the input parameters")
  .option("--dir <value>", "Directory to the log folder")
  .option("-t, --token [value]", "Given a token, return the latest portfolio value for that token in USD")
  .option("-d, --date [value]", "Given a date in mm/dd/yyyy format, return the portfolio value per token in USD on that date")
  .parse(process.argv);

const opts = program.opts();

console.time('Estimated time');

const csvFilePath = path.resolve(opts.dir, 'transactions.csv');
let csvReadStream = fs.createReadStream(csvFilePath).pipe(csvParser());

if (opts.token || opts.date) {
  if (opts.token && opts.date) {
    let finalBalance;
    let cacheDate, cacheTimestamp;

    processCsvFile(csvReadStream, (row: Transaction) => {
      if (opts.token === row.token) {
        if (!cacheTimestamp || cacheTimestamp != row.timestamp) {
          cacheTimestamp = row.timestamp;
          cacheDate = convertToDate(cacheTimestamp);
        }

        if (opts.date === cacheDate) {
          if (finalBalance) {
            finalBalance = calculateBalance(new Big(finalBalance), row.transaction_type, new Big(row.amount));
          } else {
            finalBalance = row.amount;
          }
        }
      }
    }, () => {
      printPortfolio(opts.token, finalBalance);
      console.timeEnd('Estimated time');
    });
  } else if (opts.token) {
    let finalBalance;

    processCsvFile(csvReadStream, (row: Transaction) => {
      if (opts.token === row.token) {
        if (finalBalance) {
          finalBalance = calculateBalance(new Big(finalBalance), row.transaction_type, new Big(row.amount));
        } else {
          finalBalance = row.amount;
        }
      }
    }, () => {
      printPortfolio(opts.token, finalBalance);
      console.timeEnd('Estimated time');
    });
  } else if (opts.date) {
    console.log(`date: ${opts.date}`);
    let portfolios = new Map<string, Big>();
    let cacheDate, cacheTimestamp;

    processCsvFile(csvReadStream, (row: Transaction) => {
      if (!cacheTimestamp || cacheTimestamp != row.timestamp) {
        cacheTimestamp = row.timestamp;
        cacheDate = convertToDate(cacheTimestamp);
      }

      if (opts.date === cacheDate) {
        if (portfolios.has(row.token)) {
          portfolios.set(row.token, calculateBalance(portfolios.get(row.token), row.transaction_type, new Big(row.amount)));
        } else {
          portfolios.set(row.token, new Big(row.amount));
        }
      }
    }, () => {
      printPortfolios(portfolios);
      console.timeEnd('Estimated time');
    });
  }
} else { // If no parameters are passed
  let portfolios = new Map<string, Big>();
  
  processCsvFile(csvReadStream, (row: Transaction) => {
    if (portfolios.has(row.token)) {
      portfolios.set(row.token, calculateBalance(portfolios.get(row.token), row.transaction_type, new Big(row.amount)));
    } else {
      portfolios.set(row.token, new Big(row.amount));
    }
  }, () => {
    printPortfolios(portfolios);
    console.timeEnd('Estimated time');
  });
}

/**
 * Calculates the next balance of token
 * @param currentBalance Current balance
 * @param transactionType Transaction type
 * @param amount New amount
 * @returns 
 */
function calculateBalance(currentBalance: Big, transactionType: string, amount: Big): Big { 
  if ('WITHDRAWAL' === transactionType) {
    return currentBalance.minus(amount);
  } else if ('DEPOSIT' === transactionType) {
    return currentBalance.plus(amount);
  }
}

/**
 * Reads CSV file and handles the logic
 * @param csvReadStream Read stream
 * @param handler Handler function
 * @param endHandler Error handler function
 */
function processCsvFile(csvReadStream, handler: Function, endHandler: Function): void {
  csvReadStream.on("data", handler)
  .on('end', endHandler)
  .on('error', (error) => {
    console.error(`Something went wrong: ${error}`)
  });
}

/**
 * Print out the list of portfolios
 * @param portfolios List of portfolios
 */
function printPortfolios(portfolios: Map<string, Big>): void {
  for (let [key, value] of portfolios) {
    printPortfolio(key, value);
  }
}

/**
 * Print out the portfolio
 * @param token Token name
 * @param balance The balance
 */
async function printPortfolio(token: string, balance: Big): Promise<void> {
  const price = await getCurrentPrice(token, 'USD');

  console.log(`${token}: ${balance.toPrecision(10)}`);
  console.log(`USD: ${balance.times(price).toPrecision(10)}`);
  console.log('=========================');
}

/**
 * Convert timestamp to date string
 * @param timestamp Timestamp to calculate
 * @returns 
 */
function convertToDate(timestamp: number): string {          
  // Create a new Date object using the timestamp
  const date = new Date(timestamp * 1000);
  
  // Get the date in a readable format
  return date.toLocaleDateString("en-US");
}