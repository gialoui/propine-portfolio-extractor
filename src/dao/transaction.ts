import { TransactionType } from "../enum/transaction-type";

export interface Transaction {
    timestamp: number;
    transaction_type: TransactionType;
    token: string;
    amount: number;
  }