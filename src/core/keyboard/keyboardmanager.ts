
import { AppBase } from '../../app/appbase';
import { CoreConstants } from '../../constants';
import { EventListener } from '../event/events/events';
import { EventContext } from '../event/contexts/eventcontext';
import { MouseEventContext, MouseEventArgs } from '../event/contexts/mouseeventcontext';
import { KeyboardEventContext, KeyEventArgs } from '../event/contexts/keyboardeventcontext';
import { KEYCODE_HOTKEY_MAP, SpecialHandleKeyCodeStr } from '../../constants/keyboard/keycode';

export type HotKeyHandler = () => void;

/**
 * keyboard manager to handle keyboard input
 * 
 * @export
 * @class KeyboardManager
 */
export class KeyboardManager {
  private _app: AppBase;
  public isHandlingEvent: boolean;
  private _pressedKeys: Set<string>;
  private _eventHandlers: Map<string, EventListener>;
  private _envHotkeyHandlers: Map<CoreConstants.EnvironmentTypes, Map<string, HotKeyHandler>>;

  constructor(app: AppBase) {
    this._app = app;
    this._envHotkeyHandlers = new Map();
    this._envHotkeyHandlers.set(CoreConstants.EnvironmentTypes.Default, new Map());
    this._eventHandlers = new Map();
    this._pressedKeys = new Set();
    this.isHandlingEvent = false;
    this._registerEventHandlers();
  }

  public isEventSupported(eventType: string): boolean {
    return this._eventHandlers.get(eventType) !== undefined;
  }

  public receiveEvent(eventType: string, context: EventContext): boolean {
    if (this.isHandlingEvent) {
      return false;
    }

    const eventHandler = this._eventHandlers.get(eventType);
    if (!eventHandler) {
      return false;
    }
    this.isHandlingEvent = true;
    eventHandler(context);
    this.isHandlingEvent = false;
    return context.isHandled;
  }

  private _registerEventHandlers() {
    this._eventHandlers.set(CoreConstants.EventTypes.KeyboardKeyUp, this._onKeyUp);
    this._eventHandlers.set(CoreConstants.EventTypes.KeyboardKeyDown, this._onKeyDown);
    this._eventHandlers.set(CoreConstants.EventTypes.KeyboardKeyPressed, this._onKeyPressed);
  }

  private _onKeyDown = (context: EventContext): void => {
    const keyboardContext = context as KeyboardEventContext;
    if (!keyboardContext) {
      return;
    }

    const keyCode = this._getKeyCode(keyboardContext);
    if (!keyCode || keyCode.length === 0) {
      return;
    }

    this.updateKeysByContext(keyboardContext);
    // record pressed keys first
    this._pressedKeys.add(keyCode);

    const keyStr = this._getPressedHotKeyStr();
    const command = this._app.commandManager().activeCommand();
    if (command) {
      // check the hot key for active command
      const handler = this.hotkeyHandlers.get(keyStr + command.uniqueType());
      if (handler) {
        context.isHandled = true;
        handler();
        this._pressedKeys.delete(keyCode);
        return;
      }
    }
    // check global hot key

    const gHandler = this.hotkeyHandlers.get(keyStr);
    if (gHandler) {
      gHandler();
      context.isHandled = true;
      this._pressedKeys.delete(keyCode);
      return;
    }

    //let default handle
    const sepcialKeys = Object.keys(SpecialHandleKeyCodeStr);
    sepcialKeys.forEach(val => {
      if (keyStr === (SpecialHandleKeyCodeStr as any)[val]) {
        context.isHandled = true;
        this._pressedKeys.delete(keyCode);
        return;
      }
    });

    // let event manager handle the key event
    this._app.eventManager().receiveEvent(CoreConstants.EventTypes.KeyboardKeyDown, context);
  }

  private _onKeyUp = (context: EventContext): void => {
    const keyboardContext = context as KeyboardEventContext;
    if (!keyboardContext) {
      return;
    }

    const keyCode = this._getKeyCode(keyboardContext);
    if (!keyCode || keyCode.length === 0) {
      return;
    }

    this._pressedKeys.delete(keyCode);
    this._app.eventManager().receiveEvent(CoreConstants.EventTypes.KeyboardKeyUp, context);
  }

  public updateKeysByContext(context: KeyboardEventContext | MouseEventContext): void {
    const delKeyCodeArr: string[] = [];
    let specialKeycodeGroupStr = '';
    const otherKeycodeArr: string[] = [];

    for (const keyCode of this._pressedKeys.keys()) {
      const res = this._checkKeyCode(keyCode);
      let evtArgs: KeyEventArgs | MouseEventArgs;
      if (context instanceof KeyboardEventContext) {
        evtArgs = context.keyEventArgs();
      } else {
        evtArgs = context.mouseEventArgs();
      }
      const hotkeyStr = (<any>KEYCODE_HOTKEY_MAP)[keyCode];

      if ((res.isCtrlKeyCode && !evtArgs.isCtrlPressed) || (res.isAltKeyCode && !evtArgs.isAltPressed) || (res.isShiftKeycode && !evtArgs.isShiftPressed)) {
        //记录不符合当前keyboard按键的ctrl/alt/shift键
        delKeyCodeArr.push(keyCode);
      } else if ((res.isCtrlKeyCode && evtArgs.isCtrlPressed) || (res.isAltKeyCode && evtArgs.isAltPressed) || (res.isShiftKeycode && evtArgs.isShiftPressed)) {
        //获取ctrl/alt/shift组合按键的字符串部分
        if (specialKeycodeGroupStr.length === 0) {
          specialKeycodeGroupStr += hotkeyStr;
        } else {
          specialKeycodeGroupStr += '+' + hotkeyStr;
        }
      } else {
        //记录除ctrl/alt/shift之外的其他按键
        otherKeycodeArr.push(keyCode);
      }
    }

    if (otherKeycodeArr.length > 0 && (context instanceof KeyboardEventContext)) {
      otherKeycodeArr.map((val) => {
        const keyboardCode = this._getKeyCode(context);
        const argsKeycodeStr = (<any>KEYCODE_HOTKEY_MAP)[keyboardCode];
        const gHandler = (specialKeycodeGroupStr.length > 0) ? this.hotkeyHandlers.get(`${specialKeycodeGroupStr}+${argsKeycodeStr}`) : undefined;

        const res = this._checkKeyCode(keyboardCode);
        //1.删除只按下ctrl\alt\shift键的时的其他按键(包括删除前面的其他按键) （eg:ctrl+s再按ctrl仍然是ctrl+s）
        //2.删除（除此次按键event中的keycode 并且 “ctrl(+shfit+alt)+此次按键中的keycode”在全局中能找到组合键）之外的其他键

        if ((res.isCtrlKeyCode || res.isAltKeyCode || res.isShiftKeycode) || (val !== keyboardCode && gHandler)) {
          delKeyCodeArr.push(val);
        }
      });
    }

    delKeyCodeArr.map((val) => {
      this._pressedKeys.delete(val);
      const args = new KeyEventArgs(this._app, undefined);
      args.keyCode = val;
      const keyContext = new KeyboardEventContext(this._app, args);
      this._app.eventManager().receiveEvent(CoreConstants.EventTypes.KeyboardKeyUp, keyContext);
    });
  }

  private _checkKeyCode(keyCode: string) {
    const args = { isCtrlKeyCode: false, isAltKeyCode: false, isShiftKeycode: false };

    if (keyCode) {
      args.isCtrlKeyCode = (keyCode === CoreConstants.KeyCode.CtrlLeft || keyCode === CoreConstants.KeyCode.CtrlRight);
      args.isAltKeyCode = (keyCode === CoreConstants.KeyCode.AltLeft || keyCode === CoreConstants.KeyCode.AltRight);
      args.isShiftKeycode = (keyCode === CoreConstants.KeyCode.ShiftLeft || keyCode === CoreConstants.KeyCode.ShiftRight);
    }

    return args;
  }

  private _onKeyPressed = (context: EventContext): void => {
    const keyboardContext = context as KeyboardEventContext;
    if (!keyboardContext) {
      return;
    }

    const keyCode = this._getKeyCode(keyboardContext);
    if (!keyCode || keyCode.length === 0) {
      return;
    }

    this._app.eventManager().receiveEvent(CoreConstants.EventTypes.KeyboardKeyPressed, context);
  }

  private _getKeyCode(keyboardContext: KeyboardEventContext) {
    const keyCode = keyboardContext.keyEventArgs().keyCode;
    return keyCode;
  }

  private _getPressedHotKeyStr(): string {
    let res = '';
    for (const keyCode of this._pressedKeys.values()) {
      const hotkey = (<any>KEYCODE_HOTKEY_MAP)[keyCode];
      if (!hotkey) {
        continue;
      }
      if (res.length === 0) {
        res = hotkey;
      } else {
        res += '+' + hotkey;
      }
    }
    return res;
  }


  /**
   * register global hot key or hot key for specific command
   * 
   * @param {string} hotkey 
   * @param {HotKeyHandler} handler 
   * @param {string} [cmdType] 
   * @memberof KeyboardManager
   */
  public registerHotkey(hotkey: string, handler: HotKeyHandler, cmdType?: string) {
    const hotkeyId = hotkey + (cmdType ? cmdType : '');
    this.hotkeyHandlers.set(hotkeyId, handler);
  }

  /**
   * un-register hot key
   * 
   * @param {string} hotkey 
   * @param {string} [cmdType] 
   * @memberof KeyboardManager
   */
  public unRegisterHotkey(hotkey: string, cmdType?: string) {
    const hotkeyId = hotkey + (cmdType ? cmdType : '');
    this.hotkeyHandlers.delete(hotkeyId);
  }

  /**
   * get hotkey handlers for active environment
   *
   * @readonly
   * @memberof KeyboardManager
   */
  public get hotkeyHandlers() {
    let envType = CoreConstants.EnvironmentTypes.Default;
    // const currentEnv = this._app.environmentManager().activeEnvironment;
    // if (currentEnv) {
    //   envType = currentEnv.type;
    // }
    return this._envHotkeyHandlers.get(envType)!;
  }

  public isCtrlPressed(): boolean {
    return this._pressedKeys.has(CoreConstants.KeyCode.CtrlLeft) || this._pressedKeys.has(CoreConstants.KeyCode.CtrlRight);
  }

  public isAltPressed(): boolean {
    return this._pressedKeys.has(CoreConstants.KeyCode.AltLeft) || this._pressedKeys.has(CoreConstants.KeyCode.AltRight);
  }

  public isShiftPressed(): boolean {
    return this._pressedKeys.has(CoreConstants.KeyCode.ShiftLeft) || this._pressedKeys.has(CoreConstants.KeyCode.ShiftRight);
  }
}