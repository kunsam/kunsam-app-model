
import { AppBase } from '../../app/appbase';
import { Events } from './events/events';
import { CoreConstants } from '../../constants';
import { MouseEvents } from './events/mouseevents';
import { EventContext } from './contexts/eventcontext';
import { KeyboardEvents } from './events/keyboardevents';

/**
 * app's event manager
 * 
 * @export
 * @class EventManager
 */
export class EventManager {
  private _app: AppBase;
  private _events: Map<string, Events>;
  constructor(app: AppBase) {
    this._app = app;
    this._events = new Map();
  }

  public add(events: Events) {
    this._events.set(events.EventsType(), events);
  }

  public remove(events: Events) {
    this._events.delete(events.EventsType());
  }

  public init() {
    this.add(new MouseEvents());
    this.add(new KeyboardEvents());
  }

  public mouseEvents(): MouseEvents {
    return this._events.get(CoreConstants.EventsTypes.Mouse) as MouseEvents;
  }

  public keyboardEvents(): KeyboardEvents {
    return this._events.get(CoreConstants.EventsTypes.Keyboard) as KeyboardEvents;
  }

  public receiveEvent(eventType: CoreConstants.EventTypes, context: EventContext): boolean {
    let isHandled = false;
    const mouseMgr = this._app.mouseManager();
    // first let device handle the event
    if (!mouseMgr.isHandlingEvent && mouseMgr.isEventSupported(eventType)) {
      isHandled = mouseMgr.receiveEvent(eventType, context);
      if (isHandled) {
        return isHandled;
      }
    }
    const keyboardMgr = this._app.keyboardManager();
    if (!keyboardMgr.isHandlingEvent && keyboardMgr.isEventSupported(eventType)) {
      isHandled = keyboardMgr.receiveEvent(eventType, context);
      // key event already passed to current command and event registers
      return isHandled;
    }

    // then let command manager handle the event
    const cmdMgr = this._app.commandManager();
    isHandled = cmdMgr.receiveEvent(eventType, context);
    if (isHandled) {
      return isHandled;
    }

    // finally let the events registered handle it
    const eventsArray = Array.from(this._events.values());
    for (let index = 0; index < eventsArray.length; index++) {
      const events = eventsArray[index];
      if (!events.isEventSupported(eventType)) {
        continue;
      }
      events.emitEvent(eventType, context);
      if (context.isHandled) {
        isHandled = true;
      }
    }

    return isHandled;
  }
}