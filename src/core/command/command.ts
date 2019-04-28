import { AppBase } from '../../app/appbase';
import { CoreConstants } from '../../constants';
import { CommandManager } from './commandmanager';
import { EventListener } from '../event/events/events';
import { EventContext } from '../event/contexts/eventcontext';

/**
 * command context interface
 * 
 * @export
 * @interface ICommandContext
 */
export interface ICommandContext {
  app: AppBase;
  args: any; // command arguments
}

/**
 * command factory interface
 * 
 * @export
 * @interface ICommandFactory
 */
export interface ICommandFactory {
  createCommand(cmdMgr: CommandManager, context: ICommandContext): Command;
}

/**
 * base command class
 * 
 * @export
 * @abstract
 * @class Command
 */
export abstract class Command {
  private static _commandFactories: Map<string, ICommandFactory> = new Map();

  protected cmdMgr: CommandManager;
  protected context: ICommandContext;
  protected eventHandlers: Map<string, EventListener>;

  public static uniqueType(): string {
    return CoreConstants.CommandTypes.Base;
  }

  public static registerCommandFactory(type: string, factory: ICommandFactory) {
    if (this._commandFactories.has(type)) {
      throw new Error(`Cannot register command factory for type: ${type}`);
    }
    this._commandFactories.set(type, factory);
  }

  public static isCommandFactoryAvailable(type: string): boolean {
    return this._commandFactories.get(type) !== undefined;
  }

  public static createCommand(type: string, cmdMgr: CommandManager, context: ICommandContext): Command | undefined {
    const factory = this._commandFactories.get(type);
    if (factory) {
      return factory.createCommand(cmdMgr, context);
    }
    return undefined;
  }

  constructor(cmdMgr: CommandManager, context: ICommandContext) {
    this.cmdMgr = cmdMgr;
    this.context = context;
    this.eventHandlers = new Map();
  }

  /**
   * execute this command
   * 
   * @memberof Command
   */
  public execute(): void {
    // register event handlers first
    this.registerEventHandlers();
    this.onExecute();
  }

  /**
   * end this command
   * 
   * @memberof Command
   */
  public end(): void {
    this.onTerminate();
  }

  /**
   * cancel this command
   * 
   * @memberof Command
   */
  public cancel(): void {
    this.onTerminate();
  }

  /**
   * suspend this command
   * 
   * @memberof Command
   */
  public suspend(): void {
    this.onSuspend();
  }

  /**
   * resume this command
   * 
   * @memberof Command
   */
  public resume(): void {
    this.onSuspend();
  }

  public endImmediatelyOnExecute(): boolean {
    return true;
  }

  /**
   * Check if this command can be undone on execute
   *
   * @returns {boolean}
   * @memberof Command
   */
  public canUndoOnExecute(): boolean {
    return true;
  }

  public onUndo(): void {
    if (!this.canUndoOnExecute()) {
      this.cmdMgr.cancel(this);
    }
  }

  public onRedo(): void {
    if (!this.canUndoOnExecute()) {
      this.cmdMgr.cancel(this);
    }
  }

  public startPreview() {
    this.cmdMgr.app().transactionManager().undoRedoEnabled = false;
  }

  public endPreview() {
    this.cmdMgr.app().transactionManager().undoRedoEnabled = true;
  }

  /**
   * Receive an event
   * 
   * @param {string} type 
   * @param {EventContext} context 
   * @returns {boolean} 
   * @memberof Command
   */
  public receiveEvent(type: string, context: EventContext): boolean {
    if (!type || this.eventHandlers.size <= 0) {
      return false;
    }

    const eventHandler = this.eventHandlers.get(type);
    if (!eventHandler) {
      return false;
    }

    eventHandler(context);
    return context.isHandled;
  }

  /**
   * get if an event is supported
   * 
   * @param {string} eventType 
   * @returns {boolean} 
   * @memberof Command
   */
  public isEventSupported(eventType: string): boolean {
    return this.eventHandlers.get(eventType) !== undefined;
  }

  /**
   * check if this command can be suspended
   * 
   * @returns {boolean} 
   * @memberof Command
   */
  public canSuspend(): boolean {
    return true;
  }

  /**
   * called when this command is suspended
   * 
   * @memberof Command
   */
  public onSuspend(): void { }

  /**
   * called when this command is resumed
   * 
   * @memberof Command
   */
  public onResume(): void { }

  /**
   * called when this command is done, can do some clean work
   * 
   * @memberof Command
   */
  public onTerminate(): void { }

  /**
   * derived class can regist event handler here
   * 
   * @protected
   * @memberof Command
   */
  protected registerEventHandlers(): void { }

  /**
   * called when this command is executed, derived class should implement it
   * 
   * @abstract
   * @memberof Command
   */
  public abstract onExecute(): void;

  /**
   * get unique command type, derived class should implment it
   * 
   * @returns {string} 
   * @memberof Command
   */
  public abstract uniqueType(): string;
}
