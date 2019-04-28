import { CoreConstants } from '../../../constants';
import { Events, EventListener } from './events';
import { CommandEventContext } from '../contexts/commandeventcontext';

export type CommandEventListener = (context: CommandEventContext) => void;
export class CommandEvents extends Events {
  constructor() {
    super(CoreConstants.EventsTypes.Command);
  }

  public isEventSupported(eventType: string): boolean {
    return eventType === CoreConstants.EventTypes.CommandStarted ||
      eventType === CoreConstants.EventTypes.CommandSuspended ||
      eventType === CoreConstants.EventTypes.CommandResumed ||
      eventType === CoreConstants.EventTypes.CommandTerminated ||
      eventType === CoreConstants.EventTypes.CommandCanceled;
  }

  public listenStarted(listener: CommandEventListener): void {
    this.listen(CoreConstants.EventTypes.CommandStarted, listener as EventListener);
  }

  public unlistenStarted(listener: CommandEventListener): void {
    this.unlisten(CoreConstants.EventTypes.CommandStarted, listener as EventListener);
  }

  public emitStarted(context: CommandEventContext): void {
    this.emitEvent(CoreConstants.EventTypes.CommandStarted, context);
  }

  public listenSuspended(listener: CommandEventListener): void {
    this.listen(CoreConstants.EventTypes.CommandSuspended, listener as EventListener);
  }

  public unlistenSuspended(listener: CommandEventListener): void {
    this.unlisten(CoreConstants.EventTypes.CommandSuspended, listener as EventListener);
  }

  public emitSuspended(context: CommandEventContext): void {
    this.emitEvent(CoreConstants.EventTypes.CommandSuspended, context);
  }

  public listenResumed(listener: CommandEventListener): void {
    this.listen(CoreConstants.EventTypes.CommandResumed, listener as EventListener);
  }

  public unlistenResumed(listener: CommandEventListener): void {
    this.unlisten(CoreConstants.EventTypes.CommandResumed, listener as EventListener);
  }

  public emitResumed(context: CommandEventContext): void {
    this.emitEvent(CoreConstants.EventTypes.CommandResumed, context);
  }

  public listenTerminated(listener: CommandEventListener): void {
    this.listen(CoreConstants.EventTypes.CommandTerminated, listener as EventListener);
  }

  public unlistenTerminated(listener: CommandEventListener): void {
    this.unlisten(CoreConstants.EventTypes.CommandTerminated, listener as EventListener);
  }

  public emitTerminated(context: CommandEventContext): void {
    this.emitEvent(CoreConstants.EventTypes.CommandTerminated, context);
  }

  public listenCanceled(listener: CommandEventListener): void {
    this.listen(CoreConstants.EventTypes.CommandCanceled, listener as EventListener);
  }

  public unlistenCanceled(listener: CommandEventListener): void {
    this.unlisten(CoreConstants.EventTypes.CommandCanceled, listener as EventListener);
  }

  public emitCanceled(context: CommandEventContext): void {
    this.emitEvent(CoreConstants.EventTypes.CommandCanceled, context);
  }
}