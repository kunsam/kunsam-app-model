import { Transaction } from './transaction';
import { GroupTransaction } from './grouptransaction';
import { TransactionManager } from './transactionmanager';

export class TransactionSequence {
  private _transMgr: TransactionManager;
  private _undoStack: Transaction[] = [];
  private _redoStack: Transaction[] = [];
  private _undoStackLength: number = Infinity;

  constructor(transMgr: TransactionManager) {
    this._transMgr = transMgr;
  }

  public set undoStackLength(length: number) {
    this._undoStackLength = length;
  }

  public get undoStackLength() {
    return this._undoStackLength;
  }

  public canUndo(): boolean {
    return this._undoStack.length > 0;
  }

  public countOfUndo(): Number {
    return this._undoStack.length;
  }

  public canRedo(): boolean {
    return this._redoStack.length > 0;
  }

  public peekNextUndoTransaction(): Transaction | undefined {
    return this._undoStack.length > 0 ? this._undoStack[this._undoStack.length - 1] : undefined;
  }

  public popNextUndoTransaction(): Transaction | undefined {
    return this._undoStack.length > 0 ? this._undoStack.pop() : undefined;
  }

  public peekNextRedoTransaction(): Transaction | undefined {
    return this._redoStack.length > 0 ? this._redoStack[this._redoStack.length - 1] : undefined;
  }

  public popNextRedoTransaction(): Transaction | undefined {
    return this._redoStack.length > 0 ? this._redoStack.pop() : undefined;
  }

  public undo(): void {
    const transaction = this._undoStack.pop();
    if (transaction) {
      transaction.undo();
      this._redoStack.push(transaction);
    }
  }

  public redo(): void {
    const transaction = this._redoStack.pop();
    if (transaction) {
      transaction.redo();
      this._undoStack.push(transaction);
      while (this._undoStack.length > this.undoStackLength) {
        this._undoStack.shift();
      }
    }
  }

  public commit(transaction: Transaction) {
    if (!transaction) {
      return;
    }
    transaction.commit();
    // put it into the undo stack and clean the redo stack
    this._undoStack.push(transaction);
    while (this._undoStack.length > this.undoStackLength) {
      this._undoStack.shift();
    }
    this._redoStack.length = 0;
  }

  public toTransaction(): Transaction | undefined {
    return this.mergeTransactions(this._undoStack);
  }

  public toTransactions(): Transaction[] {
    return this._undoStack;
  }

  public mergeTransactions(transactions: Transaction[]): Transaction | undefined {
    if (transactions.length <= 0) {
      return undefined;
    }

    if (transactions.length === 1) {
      return transactions[0];
    }

    const groupTransaction = this._transMgr.createTransaction(GroupTransaction.uniqueType(), {}) as GroupTransaction;
    if (groupTransaction) {
      transactions.forEach((transaction: Transaction) => {
        groupTransaction.add(transaction);
      });
    }

    return groupTransaction;
  }

  public reset() {
    this._undoStack = [];
    this._redoStack = [];
  }
}

