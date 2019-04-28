
import { AppBase, } from './appbase';
import { CoreConstants } from '../constants';
import {
  KeyEventArgs,
  KeyboardEventContext,
} from '../core/event/contexts/keyboardeventcontext';


const catchKeyCodes = [
  'Tab',
  'Space',
  'Escape',
  'AltLeft',
  'AltRight',
  'MetaLeft',
  'ShiftLeft',
  'MetaRight',
  'ShiftRight',
  'ControlLeft',
  'ControlRight',
];

const ctrlKeyCodes = [
  'KeyZ',
  'KeyR',
];

const originKeyCodes = [
  'KeyO',
  'KeyS',
];


// 
export class KeyboardEventHook{
  private _app: AppBase;
  private _isHiJack: boolean = true;;

  constructor(app: AppBase) {
    this._app = app;
  }

  private _keyuplistener = (evt: KeyboardEvent) => this.onkeyup(evt, this._app)
  private _keydownlistener = (evt: KeyboardEvent) => this.onkeydown(evt, this._app)
  private _keypresslistener = (evt: KeyboardEvent) => this.onkeypress(evt, this._app)


  public onHook(isHiJack: boolean = true) {
    this._isHiJack = !!isHiJack;
    if (isHiJack) {
      document.onkeyup = this._keyuplistener;
      document.onkeydown = this._keydownlistener;
      document.onkeypress = this._keypresslistener;
    } else {
      document.addEventListener('keyup', this._keyuplistener);
      document.addEventListener('keydown', this._keydownlistener);
      document.addEventListener('keypress', this._keypresslistener);
    }
  }

  public unHook(unHookExtends: { keyDownExtend?: Function, keyPressExtend?: Function, keyUpExtend?: Function } = {}) {
    function preventDefault(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.srcElement instanceof HTMLInputElement) {
        // 不是control o 不是control s 则不禁止
        if (!((e.ctrlKey || e.metaKey) && originKeyCodes.includes(e.code))) {
          return;
        }
      }
      e.stopPropagation();
      e.preventDefault();
    }
    if (this._isHiJack) {
      document.onkeyup = unHookExtends.keyUpExtend ? unHookExtends.keyUpExtend(preventDefault) : preventDefault;
      document.onkeydown = unHookExtends.keyDownExtend ? unHookExtends.keyDownExtend(preventDefault) : preventDefault;
      document.onkeypress = unHookExtends.keyPressExtend ? unHookExtends.keyPressExtend(preventDefault) : preventDefault;
    } else {
      document.removeEventListener('keyup', this._keyuplistener);
      document.removeEventListener('keydown', this._keydownlistener);
      document.removeEventListener('keypress', this._keypresslistener);
    }

  }

  public onkeydown(evt: KeyboardEvent, app: AppBase) {
    const filterHotKey: string[] = [];
    if (evt.target instanceof HTMLInputElement || evt.srcElement instanceof HTMLInputElement) {
      if (!catchKeyCodes.includes(evt.code) && !((evt.ctrlKey || evt.metaKey) && ctrlKeyCodes.includes(evt.code))) {
        return;
      }
    }
    if (filterHotKey.includes(evt.code)) {
      return;
    }
    const args = this.createKeyArgs(app, evt);
    const keyEvent = new KeyboardEventContext(app, args);
    if (app.eventManager().receiveEvent(CoreConstants.EventTypes.KeyboardKeyDown, keyEvent)) {
      evt.stopPropagation();
      evt.preventDefault();
    }
  }
  public onkeypress(evt: KeyboardEvent, app: AppBase) {
    if (evt.target instanceof HTMLInputElement || evt.srcElement instanceof HTMLInputElement) {
      if (!catchKeyCodes.includes(evt.code) && !((evt.ctrlKey || evt.metaKey) && ctrlKeyCodes.includes(evt.code))) {
        return;
      }
    }
    const args = this.createKeyArgs(app, evt);
    const keyEvent = new KeyboardEventContext(app, args);
    app.eventManager().receiveEvent(CoreConstants.EventTypes.KeyboardKeyPressed, keyEvent);
  }
  public onkeyup(evt: KeyboardEvent, app: AppBase) {
    const args = this.createKeyArgs(app, evt);
    const keyEvent = new KeyboardEventContext(app, args);
    app.eventManager().receiveEvent(CoreConstants.EventTypes.KeyboardKeyUp, keyEvent);
  }

  public createKeyArgs(app: AppBase, evt: KeyboardEvent) {
    const args = new KeyEventArgs(app, evt);
    return args;
  }

}

