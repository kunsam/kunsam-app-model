import { AppBase } from '../../app/appbase';
import { Transaction } from './transaction';
import { TransactionSequence } from './transactionsequence';
import { EventContextTiming } from '../event/contexts/eventcontext';
import { TransactionEvents } from '../event/events/transactionevents';
import { TransactionEventContext } from '../event/contexts/transactioneventcontext';

/**
 * transaction manager to manage the app transactions
 * 
 * @export
 * @class TransactionManager
 */
export class TransactionManager {
  public static defaultUndoStackLength = 20;

  private _app: AppBase;
  public events: TransactionEvents;
  private _undoRedoEnabled: boolean = true;
  private _defaultSequence: TransactionSequence;
  private _sequenceStack: TransactionSequence[];
  private _previewSequence?: TransactionSequence;
  private _workingTransaction: Transaction[] = [];
  private _undoRedoSequenceStack: TransactionSequence[];

  constructor(app: AppBase) {
    this._app = app;
    this._defaultSequence = new TransactionSequence(this);
    this._defaultSequence.undoStackLength = TransactionManager.defaultUndoStackLength;
    this._sequenceStack = [this._defaultSequence];
    this._undoRedoSequenceStack = [this._defaultSequence];
    this.events = new TransactionEvents();
    this._previewSequence = undefined;
  }

  public reset() {
    const sequence = this._getUndoRedoSequence();
    sequence.reset();
    this.events.emitUndoRedoStateChanged(new TransactionEventContext());
  }

  public get undoRedoEnabled() {
    return this._undoRedoEnabled;
  }

  public set undoRedoEnabled(enabled: boolean) {
    if (this._undoRedoEnabled === enabled) {
      return;
    }

    this._undoRedoEnabled = enabled;
    this.events.emitUndoRedoStateChanged(new TransactionEventContext());
  }

  /**
   * create a new transaction
   * 
   * @param {string} type - transaction unique type
   * @param {object} args - transaction arguments
   * @returns {(Transaction | undefined)} 
   * @memberof TransactionManager
   */
  public createTransaction(type: string, args: object): Transaction | undefined {
    const transaction = Transaction.createTransaction(type, {
      app: this._app,
      args: args,
    });

    if (transaction) {
      this._workingTransaction.push(transaction);
      if (this._workingTransaction.length > 1) {
        console.warn('More than one transactions is running.');
      }
    }

    return transaction;
  }

  /**
   * get latest committed transaction
   * 
   * @returns {(Transaction | undefined)} 
   * @memberof TransactionManager
   */
  public getLatestCommittedTransaction(): Transaction | undefined {
    return this._defaultSequence.peekNextUndoTransaction();
  }

  /**
   * commit a transaction
   * 
   * @param {Transaction} transaction 
   * @returns {void} 
   * @memberof TransactionManager
   */
  public commit(transaction: Transaction): void {
    if (!transaction) {
      return;
    }

    const idx = this._workingTransaction.indexOf(transaction);
    if (idx >= 0) {
      this._workingTransaction.splice(idx, 1);
    }

    const context = new TransactionEventContext(transaction);
    // emit commit event before
    context.timing = EventContextTiming.Before;
    this.events.emitCommitted(context);
    const sequence = this.getActiveSequence();
    sequence.commit(transaction);
    // emit commit event after
    context.timing = EventContextTiming.After;
    this.events.emitCommitted(context);

    if (sequence === this._getUndoRedoSequence()) {
      this.events.emitUndoRedoStateChanged(new TransactionEventContext());
    }
  }

  public discard(transaction: Transaction) {
    if (transaction) {
      const idx = this._workingTransaction.indexOf(transaction);
      if (idx >= 0) {
        this._workingTransaction.splice(idx, 1);
      }
    }
  }

  /**
   * Start a new transaction sequence, and activate it
   * 
   * @returns {TransactionSequence} 
   * @memberof TransactionManager
   */
  public startSequence(canPreviewSequence: boolean = false, undoStackLength?: number): TransactionSequence {
    const activeSequence = new TransactionSequence(this);
    if (undoStackLength !== undefined) {
      activeSequence.undoStackLength = undoStackLength;
    }

    if (canPreviewSequence) {
      this._previewSequence = activeSequence;
    } else {
      this._setSequence(activeSequence);
    }

    return activeSequence;
  }

  /**
   * commit active sequence
   * 
   * @param {boolean} [mergeTransaction=true] 
   * @returns {boolean} 
   * @memberof TransactionManager
   */
  public commitSequence(mergeTransaction: boolean = true): boolean {
    if (this._previewSequence) {
      this._setSequence(this._previewSequence);
    }

    if (this.getSequenceCount() === 1) {
      return false;
    }

    if (mergeTransaction) {
      const transaction = this.getActiveSequence().toTransaction();
      this._terminateActiveSequence();
      if (transaction) {
        this.commit(transaction);
      }
    } else {
      const transactions = this.getActiveSequence().toTransactions();
      this._terminateActiveSequence();
      transactions.forEach((transaction) => {
        this.commit(transaction);
      }, this);
    }

    return true;
  }

  /**
   * cancel active sequence
   * 
   * @returns {boolean} 
   * @memberof TransactionManager
   */
  public cancelSequence(): boolean {
    if (this.getSequenceCount() === 1 && !this._previewSequence) {
      return false;
    }
    // undo sequence
    const sequence = this.getActiveSequence();
    while (sequence.canUndo()) {
      this._undoSequence(sequence);
    }

    this._terminateActiveSequence();
    return true;
  }

  /**
   * end active sequence
   * 
   * @returns {boolean} 
   * @memberof TransactionManager
   */
  public endSequence(): boolean {
    if (this.getSequenceCount() === 1 && !this._previewSequence) {
      return false;
    }

    this._terminateActiveSequence();
    return true;
  }

  /**
   * get if this can be undone
   * 
   * @returns {boolean} 
   * @memberof TransactionManager
   */
  public canUndo(): boolean {
    return this._undoRedoEnabled && this._getUndoRedoSequence().canUndo();
  }

  /**
   * get if this can be redone
   * 
   * @returns {boolean} 
   * @memberof TransactionManager
   */
  public canRedo(): boolean {
    return this._undoRedoEnabled && this._getUndoRedoSequence().canRedo();
  }

  /**
   * undo the active sequence
   * 
   * @returns {void} 
   * @memberof TransactionManager
   */
  public undo(): void {

    if (!this.canUndo()) {
      return;
    }
    this.events.emitUndoing(new TransactionEventContext());
    this._prepareUndoRedo();
    const sequence = this.getActiveSequence();
    const transaction = this._undoSequence(sequence);
    // console.log(sequence, transaction, 'undo')
    this.events.emitUndone(new TransactionEventContext(transaction));
    this.events.emitUndoRedoStateChanged(new TransactionEventContext());
  }

  /**
   * redo the active sequence
   * 
   * @returns {void} 
   * @memberof TransactionManager
   */
  public redo(): void {
    if (!this.canRedo()) {
      return;
    }
    this.events.emitRedoing(new TransactionEventContext());
    this._prepareUndoRedo();
    const sequence = this.getActiveSequence();
    const transaction = this._redoSequence(sequence);
    this.events.emitRedone(new TransactionEventContext(transaction));
    this.events.emitUndoRedoStateChanged(new TransactionEventContext());
  }

  /**
   * undo a sequence
   * 
   * @private
   * @param {TransactionSequence} sequence 
   * @returns {void} 
   * @memberof TransactionManager
   */
  private _undoSequence(sequence: TransactionSequence): Transaction | undefined {
    const transaction = sequence.peekNextUndoTransaction();
    if (!transaction) {
      return;
    }
    sequence.undo();
    return transaction;
  }

  /**
   * redo a sequence
   * 
   * @private
   * @param {TransactionSequence} sequence 
   * @returns {void} 
   * @memberof TransactionManager
   */
  private _redoSequence(sequence: TransactionSequence): Transaction | undefined {
    const transaction = sequence.peekNextRedoTransaction();
    if (!transaction) {
      return;
    }
    sequence.redo();
    return transaction;
  }

  /**
   * get the count of the running sequence
   * 
   * @returns {number} 
   * @memberof TransactionManager
   */
  public getSequenceCount(): number {
    return this._sequenceStack.length;
  }

  /**
   * terminate active sequence
   * 
   * @private
   * @memberof TransactionManager
   */
  private _terminateActiveSequence() {
    if (this._previewSequence) {
      this._previewSequence = undefined;
      return;
    }

    const previousActiveSequence = this.getActiveSequence();
    this._sequenceStack.pop();
    if (previousActiveSequence === this._getUndoRedoSequence()) {
      this._undoRedoSequenceStack.pop();
      this.events.emitUndoRedoStateChanged(new TransactionEventContext());
    }
  }

  /**
   * get active sequence
   * 
   * @private
   * @returns {TransactionSequence} 
   * @memberof TransactionManager
   */
  public getActiveSequence(): TransactionSequence {
    if (this._previewSequence) {
      return this._previewSequence;
    }

    return this._sequenceStack[this._sequenceStack.length - 1];
  }

  /**
   * get active undo-redo sequence
   * 
   * @private
   * @returns {TransactionSequence} 
   * @memberof TransactionManager
   */
  private _getUndoRedoSequence(): TransactionSequence {
    return this._undoRedoSequenceStack[this._undoRedoSequenceStack.length - 1];
  }

  /**
   * abort previous sequence
   * 
   * @private
   * @memberof TransactionManager
   */
  private _prepareUndoRedo() {
    const sequence = this._getUndoRedoSequence();
    while (sequence !== this.getActiveSequence()) {
      this.cancelSequence();
    }
  }

  /**
   * set a sequence
   * 
   * @private
   * @memberof TransactionManager
   */
  private _setSequence(activeSequence: TransactionSequence) {
    this._sequenceStack.push(activeSequence);
    this._undoRedoSequenceStack.push(activeSequence);
    this._previewSequence = undefined;
    this.events.emitUndoRedoStateChanged(new TransactionEventContext());
  }

}

