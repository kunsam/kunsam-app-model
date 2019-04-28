import { EventContext } from '../contexts/eventcontext';
import { Transaction } from '../../transaction/transaction';

export class TransactionEventContext extends EventContext {
    public transaction?: Transaction;
    constructor(transaction?: Transaction) {
        super();
        this.transaction = transaction;
    }
}

