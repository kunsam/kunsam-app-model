
import { Command } from './command';
import { AppBase } from '../../app/appbase';
import { CommandEvents } from '../event/events/commandevents';
import { CommandEventContext } from '../event/contexts/commandeventcontext';
import { EventContextTiming, EventContext } from '../event/contexts/eventcontext';

/**
 * command manager to manage the app commands
 * 
 * @export
 * @class CommandManager
 */
export class CommandManager {
  private _app: AppBase;
  private _current?: Command;
  private _cmdToBeExecuted?: Command;
  private _pendingStack: Command[] = [];
  public events: CommandEvents = new CommandEvents();

  constructor(app: AppBase) {
    this._app = app;
    this._current = undefined;
    app.transactionManager().events.listenUndoing(this._onUndo);
    app.transactionManager().events.listenRedoing(this._onRedo);
  }

  public app(): AppBase {
    return this._app;
  }

  /**
   * get the running commands
   * 
   * @returns {Command[]} 
   * @memberof CommandManager
   */
  public getRunningCommands(): Command[] {
    const rets = [];
    if (this._current) {
      rets.push(this._current);
    }
    return rets.concat(this._pendingStack);
  }

  /**
   * called when this manager receives a event
   * 
   * @param {string} type 
   * @param {EventContext} context 
   * @returns {boolean} 
   * @memberof CommandManager
   */
  public receiveEvent(type: string, context: EventContext): boolean {
    if (!this._current) {
      return false;
    }
    return this._current.receiveEvent(type, context);
  }

  /**
   * resume a command
   * 
   * @param {Command} cmd 
   * @returns {void} 
   * @memberof CommandManager
   */
  public resume(cmd: Command): void {
    if (!cmd) {
      return;
    }

    const context = new CommandEventContext(cmd);
    // emit resumed event before
    context.timing = EventContextTiming.Before;
    this.events.emitResumed(context);
    cmd.resume();
    // emit resumed event after
    context.timing = EventContextTiming.After;
    this.events.emitResumed(context);
  }

  /**
   * suspend a command
   * 
   * @param {Command} cmd 
   * @returns {void} 
   * @memberof CommandManager
   */
  public suspend(cmd: Command): void {
    if (!cmd) {
      return;
    }

    const cxt = new CommandEventContext(cmd);
    // emit suspended event before
    cxt.timing = EventContextTiming.Before;
    this.events.emitSuspended(cxt);
    cmd.suspend();
    // emit suspended event after
    cxt.timing = EventContextTiming.After;
    this.events.emitSuspended(cxt);
  }

  /**
   * end a command
   * 
   * @param {(Command | undefined)} cmd 
   * @memberof CommandManager
   */
  public end(cmd: Command | undefined): void {
    let cmdToEnd = cmd;
    if (!cmdToEnd) {
      cmdToEnd = this._current;
    }
    if (cmdToEnd !== this._current) {
      throw new Error('end a non-active command is not supported currently');
    }

    // there should always be a running command
    if (!this._cmdToBeExecuted && this._pendingStack.length > 0) {
      if (cmdToEnd) {
        const context = new CommandEventContext(cmdToEnd);
        // emit terminated event before
        context.timing = EventContextTiming.Before;
        this.events.emitTerminated(context);
        cmdToEnd.end();
        // emit terminated event after
        context.timing = EventContextTiming.After;
        this.events.emitTerminated(context);
      }

      // resume the pending ones...
      this._current = this._pendingStack.pop();
      if (this._current) {
        this.resume(this._current);
      }
    }
  }

  /**
   * cancel a command
   * 
   * @param {(Command | undefined)} cmd 
   * @memberof CommandManager
   */
  public cancel(cmd: Command | undefined): void {
    let cmdToCancel = cmd;
    if (!cmdToCancel) {
      cmdToCancel = this._current;
    }
    if (cmdToCancel !== this._current) {
      throw new Error('end a non-active command is not supported currently');
    }

    // there should always be a running command
    if (this._pendingStack.length > 0) {
      if (cmdToCancel) {
        const context = new CommandEventContext(cmdToCancel);
        // emit canceled event before
        context.timing = EventContextTiming.Before;
        this.events.emitCanceled(context);
        cmdToCancel.cancel();
        // emit canceled event after
        context.timing = EventContextTiming.After;
        this.events.emitCanceled(context);
      }

      // resume the pending ones...
      this._current = this._pendingStack.pop();
      if (this._current) {
        this.resume(this._current);
      }
    }
  }

  /**
   * execute a command
   * 
   * @param {Command} cmd 
   * @returns {void} 
   * @memberof CommandManager
   */
  public execute(cmd: Command): void {
    if (!cmd) {
      return;
    }

    this._cmdToBeExecuted = cmd;

    if (this._current) {
      const current = this._current;
      if (current.canSuspend()) {
        this._pendingStack.push(current);
        this.suspend(current);
      } else {
        const cxt = new CommandEventContext(current);
        // emit terminated event before
        cxt.timing = EventContextTiming.Before;
        this.events.emitTerminated(cxt);
        current.end();
        // emit terminated event after
        cxt.timing = EventContextTiming.After;
        this.events.emitTerminated(cxt);
      }
    }

    this._current = cmd;
    const context = new CommandEventContext(cmd);
    // emit started event before
    context.timing = EventContextTiming.Before;
    this.events.emitStarted(context);
    this._current.execute();
    // emit started event after
    context.timing = EventContextTiming.After;
    this.events.emitStarted(context);

    this._cmdToBeExecuted = undefined;

    if (cmd.endImmediatelyOnExecute()) {
      this.end(cmd);
    }
  }

  /**
   * create a command
   * 
   * @param {string} type - unique command type
   * @param {object} args - command arguments
   * @returns {(Command | undefined)} 
   * @memberof CommandManager
   */
  public createCommand(type: string, args: object): Command | undefined {
    const command = Command.createCommand(type, this, {
      app: this._app,
      args: args,
    });

    return command;
  }

  /**
   * check if a command is available
   * 
   * @param {string} type 
   * @returns {boolean} 
   * @memberof CommandManager
   */
  public isCommandAvailable(type: string): boolean {
    if (!type) {
      return false;
    }

    return Command.isCommandFactoryAvailable(type);
  }

  /**
   * Get active command
   * 
   * @returns {(Command | undefined)} 
   * @memberof CommandManager
   */
  public activeCommand(): Command | undefined {
    return this._current;
  }

  protected _onUndo = (_context: EventContext) => {
    if (!this._current) {
      return;
    }

    this._current.onUndo();
  }

  protected _onRedo = (_context: EventContext) => {
    if (!this._current) {
      return;
    }
    this._current.onRedo();
  }
}