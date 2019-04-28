import { CoreConstants } from '../../../constants';
import { Events, EventListener } from './events';
import { TransactionEventContext } from '../contexts/transactioneventcontext';

export class TransactionEvents extends Events {
  constructor() {
    super(CoreConstants.EventsTypes.Transaction);
  }

  public isEventSupported(eventType: string): boolean {
    return eventType === CoreConstants.EventTypes.TransactionCommitted ||
      eventType === CoreConstants.EventTypes.TransactionRedoing ||
      eventType === CoreConstants.EventTypes.TransactionUndoing ||
      eventType === CoreConstants.EventTypes.TransactionRedone ||
      eventType === CoreConstants.EventTypes.TransactionUndone ||
      eventType === CoreConstants.EventTypes.TransactionUndoRedoStateChanged;
  }

  public listenCommitted(listener: EventListener): void {
    this.listen(CoreConstants.EventTypes.TransactionCommitted, listener);
  }

  public unlistenCommitted(listener: EventListener): void {
    this.unlisten(CoreConstants.EventTypes.TransactionCommitted, listener);
  }

  public emitCommitted(context: TransactionEventContext): void {
    this.emitEvent(CoreConstants.EventTypes.TransactionCommitted, context);
  }

  public listenUndoing(listener: EventListener): void {
    this.listen(CoreConstants.EventTypes.TransactionUndoing, listener);
  }

  public unlistenUndoing(listener: EventListener): void {
    this.unlisten(CoreConstants.EventTypes.TransactionUndoing, listener);
  }

  public emitUndoing(context: TransactionEventContext): void {
    this.emitEvent(CoreConstants.EventTypes.TransactionUndoing, context);
  }

  public listenUndone(listener: EventListener): void {
    this.listen(CoreConstants.EventTypes.TransactionUndone, listener);
  }

  public unlistenUndone(listener: EventListener): void {
    this.unlisten(CoreConstants.EventTypes.TransactionUndone, listener);
  }

  public emitUndone(context: TransactionEventContext): void {
    this.emitEvent(CoreConstants.EventTypes.TransactionUndone, context);
  }

  public listenRedoing(listener: EventListener): void {
    this.listen(CoreConstants.EventTypes.TransactionRedoing, listener);
  }

  public unlistenRedoing(listener: EventListener): void {
    this.unlisten(CoreConstants.EventTypes.TransactionRedoing, listener);
  }

  public emitRedoing(context: TransactionEventContext): void {
    this.emitEvent(CoreConstants.EventTypes.TransactionRedoing, context);
  }

  public listenRedone(listener: EventListener): void {
    this.listen(CoreConstants.EventTypes.TransactionRedone, listener);
  }

  public unlistenRedone(listener: EventListener): void {
    this.unlisten(CoreConstants.EventTypes.TransactionRedone, listener);
  }

  public emitRedone(context: TransactionEventContext): void {
    this.emitEvent(CoreConstants.EventTypes.TransactionRedone, context);
  }

  public listenUndoRedoStateChanged(listener: EventListener): void {
    this.listen(CoreConstants.EventTypes.TransactionUndoRedoStateChanged, listener);
  }

  public unlistenUndoRedoStateChanged(listener: EventListener): void {
    this.unlisten(CoreConstants.EventTypes.TransactionUndoRedoStateChanged, listener);
  }

  public emitUndoRedoStateChanged(context: TransactionEventContext): void {
    this.emitEvent(CoreConstants.EventTypes.TransactionUndoRedoStateChanged, context);
  }

}