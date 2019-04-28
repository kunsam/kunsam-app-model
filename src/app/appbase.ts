import { CoreConstants } from "../constants";
import { MouseManager } from '../core/mouse/mousemanager';
import { EventManager } from '../core/event/eventmanager';
import { CommandManager } from '../core/command/commandmanager';
import { KeyboardManager } from '../core/keyboard/keyboardmanager';
import { TransactionManager } from '../core/transaction/transactionmanager';


export class AppBase {

  protected _cmdMgr: CommandManager;
  protected _eventMgr: EventManager;
  protected _mouseMgr: MouseManager;
  protected _transMgr: TransactionManager;
  protected _keyboardMgr: KeyboardManager;
  protected _platform: CoreConstants.PlatformTypes;
  protected _browser: CoreConstants.BrowserTypes | undefined;

  constructor() {
    this._transMgr = new TransactionManager(this);
    this._cmdMgr = new CommandManager(this);
    this._eventMgr = new EventManager(this);
    this._mouseMgr = new MouseManager(this);
    this._keyboardMgr = new KeyboardManager(this);
    this._eventMgr.init();
    this._platform = CoreConstants.PlatformTypes.Windows;
  }


  public transactionManager(): TransactionManager {
    return this._transMgr;
  }

  public commandManager(): CommandManager {
    return this._cmdMgr;
  }

  public eventManager(): EventManager {
    return this._eventMgr;
  }

  public mouseManager(): MouseManager {
    return this._mouseMgr;
  }

  public keyboardManager(): KeyboardManager {
    return this._keyboardMgr;
  }

  public get platform() {
    return this._platform;
  }
  public set platform(type: CoreConstants.PlatformTypes) {
    this._platform = type;
  }

  public get broswer() {
    return this._browser;
  }
  public set broswer(browser: CoreConstants.BrowserTypes | undefined) {
    this._browser = browser;
  }

}