import { CoreConstants } from '../../../constants';
import { Events, EventListener } from './events';
import { KeyboardEventContext } from '../contexts/keyboardeventcontext';

export type KeyboardEventListener = (context: KeyboardEventContext) => void;

export class KeyboardEvents extends Events {
  constructor() {
    super(CoreConstants.EventsTypes.Keyboard);
  }

  public isEventSupported(eventType: string): boolean {
    return eventType === CoreConstants.EventTypes.KeyboardKeyDown ||
      eventType === CoreConstants.EventTypes.KeyboardKeyPressed ||
      eventType === CoreConstants.EventTypes.KeyboardKeyUp;
  }

  public listenKeyDown(listener: KeyboardEventListener): void {
    this.listen(CoreConstants.EventTypes.KeyboardKeyDown, listener as EventListener);
  }

  public unlistenKeyDown(listener: KeyboardEventListener): void {
    this.unlisten(CoreConstants.EventTypes.KeyboardKeyDown, listener as EventListener);
  }

  public listenKeyPressed(listener: EventListener): void {
    this.listen(CoreConstants.EventTypes.KeyboardKeyPressed, listener as EventListener);
  }

  public unlistenKeyPressed(listener: KeyboardEventListener): void {
    this.unlisten(CoreConstants.EventTypes.KeyboardKeyPressed, listener as EventListener);
  }

  public listenKeyUp(listener: KeyboardEventListener): void {
    this.listen(CoreConstants.EventTypes.KeyboardKeyUp, listener as EventListener);
  }

  public unlistenKeyUp(listener: KeyboardEventListener): void {
    this.unlisten(CoreConstants.EventTypes.KeyboardKeyUp, listener as EventListener);
  }

  public emitKeyUp(context: KeyboardEventContext): void {
    this.emitEvent(CoreConstants.EventTypes.KeyboardKeyUp, context);
  }

  public emitKeyPressed(context: KeyboardEventContext): void {
    this.emitEvent(CoreConstants.EventTypes.KeyboardKeyPressed, context);
  }

  public emitKeyDown(context: KeyboardEventContext): void {
    this.emitEvent(CoreConstants.EventTypes.KeyboardKeyDown, context);
  }
}