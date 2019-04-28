import { CoreConstants } from '../../constants';
import { Transaction, ITransactionContext } from './transaction';

/**
 * group transaction containing a transaction collection
 * 
 * @export
 * @class GroupTransaction
 * @extends {Transaction}
 */
export class GroupTransaction extends Transaction {
  private _childTransactions: Transaction[] = [];

  public static uniqueType(): string {
    return CoreConstants.TransactionTypes.Group;
  }

  constructor(context: ITransactionContext, childTxns: Transaction[]) {
    super(context);
    this._childTransactions = childTxns;
  }

  public add(transaction: Transaction): void {
    this._childTransactions.push(transaction);
  }

  public onCommit(): any {
    this._childTransactions.forEach((transaction) => {
      transaction.commit();
    });

    const lastTxn = this._childTransactions.length > 0 ? this._childTransactions[this._childTransactions.length - 1] : undefined;
    return lastTxn ? lastTxn.result : {};
  }

  public onUndo() {
    // undo in reversed order
    for (let index = this._childTransactions.length - 1; index >= 0; index--) {
      const transaction = this._childTransactions[index];
      transaction.onUndo();
    }
  }

  public onRedo() {
    this._childTransactions.forEach(function (transaction) {
      transaction.onRedo();
    });
  }

  public childTransactions() {
    return this._childTransactions;
  }
}

Transaction.registerTransactionFactory(GroupTransaction.uniqueType(), {
  createTransaction(context: ITransactionContext): Transaction {
    return new GroupTransaction(context, []);
  },
});

