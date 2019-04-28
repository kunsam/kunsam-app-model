import { EventEmitter } from 'events';
import { EventContext } from '../contexts/eventcontext';

export type EventListener = (context: EventContext) => void;

/**
 * base class for events
 * use unique type in constants as events type
 * 
 * @export
 * @class Events
 */
export class Events {
    protected eventsType: string;
    protected eventEmitter: EventEmitter;
    constructor(eventsType: string) {
      this.eventsType = eventsType;
      this.eventEmitter = new EventEmitter();
    }

    public listen(eventType: string, listener: EventListener) {
      if (!this.isEventSupported(eventType)) {
          throw new Error(`unsupport events: ${eventType}`);
      }
      if (!this.eventEmitter.listeners(eventType).includes(listener)) {
          this.eventEmitter.addListener(eventType, listener);
      }
    }

    public unlisten(eventType: string, listener: EventListener) {
      if (!this.isEventSupported(eventType)) {
          throw new Error(`unsupport events: ${eventType}`);
      }
      this.eventEmitter.removeListener(eventType, listener);
    }

    public unlistenAll(eventType: string | undefined) {
      if (eventType && !this.isEventSupported(eventType as string)) {
          throw new Error(`unsupport events: ${eventType}`);
      }
      this.eventEmitter.removeAllListeners(eventType);
    }

    public emitEvent(eventType: string, context: EventContext) {
      if (!this.isEventSupported(eventType)) {
          throw new Error(`unsupport events: ${eventType}`);
      }
      this.eventEmitter.emit(eventType, context);
    }

    public dispose() {
      this.unlistenAll(undefined);
    }

    public isEventSupported(eventType: string): boolean {
      return eventType !== undefined;
    }

    public EventsType(): string {
      return this.eventsType;
    }

}