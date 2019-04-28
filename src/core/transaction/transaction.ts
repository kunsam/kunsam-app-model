import { AppBase } from '../../app/appbase';

/**
 * transaction context interface
 * 
 * @export
 * @interface ITransactionContext
 */
export interface ITransactionContext {
  app: AppBase;
  args: any; // transaction arguments
}

/**
 * transaction factory interface
 * 
 * @export
 * @interface ITransactionFactory
 */
export interface ITransactionFactory {
  createTransaction(context: ITransactionContext): Transaction;
}

/**
 * base transaction class
 * 
 * @export
 * @abstract
 * @class Transaction
 */
export abstract class Transaction {
  public result: any;
  protected context: ITransactionContext;
  protected isCommitted: boolean = false;
  private static _transactionFactories: Map<string, ITransactionFactory> = new Map();

  public static uniqueType(): string {
    return 'transaction';
  }

  public static registerTransactionFactory(type: string, factory: ITransactionFactory) {
    if (this._transactionFactories.has(type)) {
      throw new Error(`Cannot register transaction factory for type: ${type}`);
    }
    this._transactionFactories.set(type, factory);
  }

  public static isTransactionFactoryAvailable(type: string): boolean {
    return this._transactionFactories.get(type) !== undefined;
  }

  public static createTransaction(type: string, context: ITransactionContext): Transaction | undefined {
    const factory = this._transactionFactories.get(type);
    if (factory) {
      return factory.createTransaction(context);
    }
    return undefined;
  }

  constructor(context: ITransactionContext) {
    this.context = context;
  }

  /**
   * commit this transaction
   * 
   * @returns {void} 
   * @memberof Transaction
   */
  public commit(): void {
    if (this.isCommitted) {
      return;
    }
    this.result = this.onCommit();
    this.isCommitted = true;
  }

  /**
   * undo this transaction
   * 
   * @memberof Transaction
   */
  public undo(): void {
    this.onUndo();
  }

  /**
   * redo this transaction
   * 
   * @memberof Transaction
   */
  public redo(): void {
    this.onRedo();
  }

  /**
   * called when this transaction is undone
   * 
   * @memberof Transaction
   */
  public onUndo(): void {
    //
  }

  /**
   * called when this transaction is redone
   * 
   * @memberof Transaction
   */
  public onRedo(): void {
    //
  }

  /**
   * called when this transaction is committed, derived class should implement this
   * 
   * @abstract
   * @returns {any} 
   * @memberof Transaction
   */
  public abstract onCommit(): any;
}
