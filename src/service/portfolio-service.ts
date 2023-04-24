import Big from 'big.js';
import { getCurrentPrice } from "../client/cryptocompare";
import { TransactionType } from '../enum/transaction-type';

/**
 * Reads CSV file and handles the logic
 * @param csvReadStream Read stream
 * @param handler Handler function
 * @param endHandler Error handler function
 */
export function processCsvFile(csvReadStream, handler: Function, endHandler: Function): void {
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
export function printPortfolios(portfolios: Map<string, Big>): void {
    for (let [key, value] of portfolios) {
        printPortfolio(key, value);
    }
}
  
/**
 * Print out the portfolio
 * @param token Token name
 * @param balance The balance
 */
export async function printPortfolio(token: string, balance: Big): Promise<void> {
    const price = await getCurrentPrice(token, 'USD');

    console.log(`${token}: ${balance?.toPrecision(10)}`);
    console.log(`USD: ${balance?.times(price).toPrecision(10)}`);
    console.log('=========================');
}

/**
 * Convert timestamp to date string
 * @param timestamp Timestamp to calculate
 * @returns 
 */
export function convertToDate(timestamp: number): string {          
    // Create a new Date object using the timestamp
    const date = new Date(timestamp * 1000);

    // Get the date in a readable format
    return date.toLocaleDateString("en-US");
}

/**
 * Calculates the next balance of token
 * @param currentBalance Current balance
 * @param transactionType Transaction type
 * @param amount New amount
 * @returns 
 */
export function calculateBalance(currentBalance: Big, transactionType: TransactionType, amount: Big): Big { 
    if (TransactionType.WITHDRAWAL === transactionType) {
        return currentBalance.minus(amount);
    } else if (TransactionType.DEPOSIT === transactionType) {
        return currentBalance.plus(amount);
    }
}