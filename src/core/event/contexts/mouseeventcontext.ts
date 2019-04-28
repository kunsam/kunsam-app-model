import { AppBase } from '../../../app/appbase';
import { EventContext } from './eventcontext';
import { CoreConstants } from '../../../constants';
import { Point2D } from '../../../class/geometry';

export enum MouseEnvironmentType {
  content = 'content',
  catalog = 'catalog',
}

export class MouseEventArgs {
  public location: Point2D = new Point2D();  // relative to container
  public button: string = CoreConstants.MouseButtonTypes.Left;
  public modelLocation?: Point2D;
  public userData?: any;
  public page?: Point2D;
  public client?: Point2D;
  public screen?: Point2D;
  public wheelDelta?: number; // wheel delta
  public isAltPressed?: boolean = false;
  public isCtrlPressed?: boolean = false;
  public isShiftPressed?: boolean = false;
  public target?: HTMLElement;

  constructor(app: AppBase, event: any, /* DOM mouse event */ userData?: any) {

    this.userData = userData;
    if (event === undefined) {
      return;
    }

    this.target = event.target;

    if (event.offsetX !== undefined && event.offsetY !== undefined) {
      this.location = new Point2D(event.offsetX, event.offsetY);
    }

    if (event.button !== undefined) {
      switch (event.button) {
        case 0:
          this.button = CoreConstants.MouseButtonTypes.Left;
          break;
        case 1:
          this.button = CoreConstants.MouseButtonTypes.Middle;
          break;
        case 2:
          this.button = CoreConstants.MouseButtonTypes.Right;
          break;
      }
    }

    if (event.pageX !== undefined && event.pageY !== undefined) {
      this.page = new Point2D(event.pageX, event.pageY);
    }

    if (event.clientX !== undefined && event.clientY !== undefined) {
      this.client = new Point2D(event.clientX, event.clientY);
    }

    if (event.screenX !== undefined && event.screenY !== undefined) {
      this.screen = new Point2D(event.screenX, event.screenY);
    }

    if (event.wheelDelta !== undefined) {
      this.wheelDelta = event.wheelDelta;
    }

    this.updateSpecKeyStatus(app, event);
  }

  public updateSpecKeyStatus(app: AppBase, event: any) {
    if (event.altKey !== undefined) {
      this.isAltPressed = event.altKey;
    }

    if (event.ctrlKey !== undefined) {
      this.isCtrlPressed = event.ctrlKey;
    }

    if (event.shiftKey !== undefined) {
      this.isShiftPressed = event.shiftKey;
    }

    if (app.platform === CoreConstants.PlatformTypes.Mac && event.metaKey) {
      this.isCtrlPressed = true;
    }
  }
}

export class MouseEventContext extends EventContext {
  public mouseType: MouseEnvironmentType;

  constructor(app: AppBase, mouseType: MouseEnvironmentType, args: MouseEventArgs) {
    super(app);
    this.args = args;
    this.mouseType = mouseType;
  }

  public static create(context: MouseEventContext) {
    const app = context.app as AppBase;
    const mouseType = context.mouseType;
    const args = context.mouseEventArgs();
    return new MouseEventContext(app, mouseType, args);
  }

  public mouseEventArgs(): MouseEventArgs {
    return this.args as MouseEventArgs;
  }
}
