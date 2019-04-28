import { AppBase } from './appbase';
import { CoreConstants } from "../constants";
import { MouseEventArgs, MouseEventContext, MouseEnvironmentType } from './../core/event/contexts/mouseeventcontext';



export class MouseEventHook {
  private _app: AppBase;

  constructor(app: AppBase) {
    this._app = app;
  }

  public onHook() {
    const domElement = document;
    // todo add another
    domElement.onmousedown = (evt) => {
      const mouseEventContexts = this._createMouseEventContext(evt);
      mouseEventContexts.forEach((mouseEventContext) => {
        this._app.eventManager().receiveEvent(CoreConstants.EventTypes.MouseDown, mouseEventContext);
      });
    };

    domElement.onmouseup = (evt) => {
      const mouseEventContexts = this._createMouseEventContext(evt);
      mouseEventContexts.forEach((mouseEventContext) => {
        this._app.eventManager().receiveEvent(CoreConstants.EventTypes.MouseUp, mouseEventContext);
      });
    };

    domElement.onmousemove = (evt) => {
      const mouseEventContexts = this._createMouseEventContext(evt);
      mouseEventContexts.forEach((mouseEventContext) => {
        this._app.eventManager().receiveEvent(CoreConstants.EventTypes.MouseMove, mouseEventContext);
      });
    };

    // document.onwheel = (evt) => {
    //   // console.log(evt, 'onmousewheelwidth: 2000width: 2000')
    //   evt.preventDefault();
    //   evt.stopPropagation();
    // }

  }

  private _createMouseEventContext(evt: MouseEvent) {
    const result: MouseEventContext[] = [];
    const argsArray = this._createMouseEventArgs(evt);
    argsArray.forEach((args) => {
        const mouseEventContext = new MouseEventContext(this._app, MouseEnvironmentType.content, args);
        result.push(mouseEventContext);
    });
    return result;
  }

  private _createMouseEventArgs(evt: MouseEvent) {
    const result: MouseEventArgs[] = [];
    if ((evt.button === 1 && evt.buttons === 0) || (evt.button === 1 && evt.buttons === 4)) {
      const args = new MouseEventArgs(this._app, evt);
      args.button = CoreConstants.MouseButtonTypes.Middle;
      result.push(args);
    } else if ((evt.button === 2 && evt.buttons === 0) || (evt.button === 2 && evt.buttons === 2) || (evt.button === 2 && evt.buttons === 1)) {
      const args = new MouseEventArgs(this._app, evt);
      args.button = CoreConstants.MouseButtonTypes.Right;
      result.push(args);
    } else if (evt.button === 0 && evt.buttons === 4) {
      const args1 = new MouseEventArgs(this._app, evt);
      args1.button = CoreConstants.MouseButtonTypes.Left;
      result.push(args1);

      const args2 = new MouseEventArgs(this._app, evt);
      args2.button = CoreConstants.MouseButtonTypes.Middle;
      result.push(args2);
    } else if ((evt.button === 0 && evt.buttons === 2) || (evt.button === 2 && evt.buttons === 1)) {
      const args1 = new MouseEventArgs(this._app, evt);
      args1.button = CoreConstants.MouseButtonTypes.Left;
      result.push(args1);
      const args2 = new MouseEventArgs(this._app, evt);
      args2.button = CoreConstants.MouseButtonTypes.Right;
      result.push(args2);
    } else if (evt.button === 1 && evt.buttons === 2) {
      const args1 = new MouseEventArgs(this._app, evt);
      args1.button = CoreConstants.MouseButtonTypes.Middle;
      result.push(args1);

      const args2 = new MouseEventArgs(this._app, evt);
      args2.button = CoreConstants.MouseButtonTypes.Right;
      result.push(args2);
    } else if (evt.button === 0 && evt.buttons === 6) {
      const args1 = new MouseEventArgs(this._app, evt);
      args1.button = CoreConstants.MouseButtonTypes.Left;
      result.push(args1);

      const args2 = new MouseEventArgs(this._app, evt);
      args2.button = CoreConstants.MouseButtonTypes.Middle;
      result.push(args2);

      const args3 = new MouseEventArgs(this._app, evt);
      args3.button = CoreConstants.MouseButtonTypes.Right;
      result.push(args3);
    } else if (evt.type === 'mousemove' && evt.button === 0 && evt.buttons === 0) {
      const args = new MouseEventArgs(this._app, evt);
      args.button = CoreConstants.MouseButtonTypes.None;
      result.push(args);
    } else {
      const args = new MouseEventArgs(this._app, evt);
      args.button = CoreConstants.MouseButtonTypes.Left;
      result.push(args);
    }

    return result;
  }

}