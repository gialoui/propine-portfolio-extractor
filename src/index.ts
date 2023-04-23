import Big from 'big.js';
import { Command } from 'commander';
import csvParser from 'csv-parser';
import * as figlet from 'figlet';
import * as fs from "fs";
import * as path from "path";
import { Transaction } from './dao/transaction';

const program = new Command();

console.log(figlet.textSync("Propine Helper"));

program
  .version("1.0.0")
  .description("CLI application aims to compute the portfolio of crypto investor based on the input parameters")
  .option("--dir <value>", "Directory to the log folder")
  .option("-t, --token [value]", "Given a token, return the latest portfolio value for that token in USD")
  .option("-d, --date [value]", "Given a date, return the portfolio value per token in USD on that date")
  .parse(process.argv);

const opts = program.opts();

console.time('Estimated time');

const csvFilePath = path.resolve(opts.dir, 'transactions.csv');
let csvReadStream = fs.createReadStream(csvFilePath).pipe(csvParser());

if (opts.token || opts.date) {
  if (opts.token && opts.date) {

  } else if (opts.token) {
    console.log(`token: ${opts.token}`);
  } else if (opts.date) {
    console.log(`date: ${opts.date}`);
  }
} else {
  let portfolios = new Map<string, Big>();
  
  csvReadStream.on("data", (row: Transaction) => {
    if (portfolios.has(row.token)) {
      portfolios.set(row.token, calculateBalance(portfolios.get(row.token), row.transaction_type, new Big(row.amount)));
    } else {
      portfolios.set(row.token, new Big(row.amount));
    }
  })
  .on('end', () => {
    for (let [key, value] of portfolios) {
      console.log(`${key}: ${value.toPrecision(10)}`)
    }

    console.timeEnd('Estimated time');
  })
  .on('error', (error) => {
    console.error(`Something went wrong: ${error}`)
  });
}

function calculateBalance(currentBalance: Big, transactionType: string, amount: Big): Big { 
  if ('WITHDRAWAL' === transactionType) {
    return currentBalance.minus(amount);
  } else if ('DEPOSIT' === transactionType) {
    return currentBalance.plus(amount);
  }
}
