
import { AppBase } from '../../app/appbase';
import { CoreConstants } from '../../constants';
import { EventListener } from '../event/events/events';
import { EventContext } from '../event/contexts/eventcontext';
import { MouseEventContext } from '../event/contexts/mouseeventcontext';


interface IMouseStatus {
    isMouseDown: boolean;
    isDragging: boolean;
    downContext?: MouseEventContext;
}

/**
 * mouse manager to handle mouse input
 * 
 * @export
 * @class MouseManager
 */
export class MouseManager {
  public static clickDistance: number = 3;

  private _app: AppBase;
  private _clickTime: number = 0;
  public isHandlingEvent: boolean = false;
  private _mouseStatusMap: Map<string, IMouseStatus>;
  private _eventHandlers: Map<CoreConstants.EventTypes, EventListener> = new Map();

  constructor(app: AppBase) {
    this._app = app;
    this._mouseStatusMap = new Map();
    this._initializeMouseStatus();
    this._registerEventHandlers();
  }

    private _initializeMouseStatus() {
      [
        CoreConstants.MouseButtonTypes.Left,
        CoreConstants.MouseButtonTypes.Right,
        CoreConstants.MouseButtonTypes.Middle
      ].forEach(key => {
        this._mouseStatusMap.set(key, {
          isMouseDown: false,
          isDragging: false,
        });
      });
    }

    public isEventSupported(eventTypes: CoreConstants.EventTypes): boolean {
        return this._eventHandlers.get(eventTypes) !== undefined;
    }

    public receiveEvent(eventTypes: CoreConstants.EventTypes, context: EventContext): boolean {
      if (this.isHandlingEvent) {
        return false;
      }

      const eventHandler = this._eventHandlers.get(eventTypes);
      if (!eventHandler) {
        return false;
      }

      this.isHandlingEvent = true;
      this._app.keyboardManager().updateKeysByContext(context as MouseEventContext);
      eventHandler(context);
      this.isHandlingEvent = false;
      return true;
    }

    public isMouseDown(button: CoreConstants.MouseButtonTypes) {
      const mouseStatus = this._mouseStatusMap.get(button);
      if (!mouseStatus) {
          return false;
      }

      return mouseStatus.isMouseDown;
    }

    private _registerEventHandlers() {
      this._eventHandlers.set(CoreConstants.EventTypes.MouseUp, this._onMouseUp.bind(this));
      this._eventHandlers.set(CoreConstants.EventTypes.MouseOut, this._onMouseOut.bind(this));
      this._eventHandlers.set(CoreConstants.EventTypes.MouseOver, this._onMouseOver.bind(this));
      this._eventHandlers.set(CoreConstants.EventTypes.MouseMove, this._onMouseMove.bind(this));
      this._eventHandlers.set(CoreConstants.EventTypes.MouseDown, this._onMouseDown.bind(this));
      this._eventHandlers.set(CoreConstants.EventTypes.MouseClick, this._onMouseClick.bind(this));
      this._eventHandlers.set(CoreConstants.EventTypes.MouseWheel, this._onMouseWheel.bind(this));
      this._eventHandlers.set(CoreConstants.EventTypes.MouseDragEnd, this._onMouseDragEnd.bind(this));
      this._eventHandlers.set(CoreConstants.EventTypes.MouseDblClick, this._onMouseDblClick.bind(this));
      this._eventHandlers.set(CoreConstants.EventTypes.MouseDragMove, this._onMouseDragMove.bind(this));
      this._eventHandlers.set(CoreConstants.EventTypes.MouseDragStart, this._onMouseDragStart.bind(this));
    }

    private _onMouseMove(context: EventContext): void {
      const mouseContext = context as MouseEventContext;
      if (!mouseContext) {
        return;
      }

      let mouseStatus;
      if (mouseContext.mouseEventArgs().button === CoreConstants.MouseButtonTypes.None) {
          let isAnyDragging = false;
          this._mouseStatusMap.forEach(status => {
            if (status.isDragging) {
              isAnyDragging = true;
            }
            status.isDragging = false;
            status.isMouseDown = false;
            status.downContext = undefined;
          });
          // 有任意的dragging 都要dragEnd告知结束
          if (isAnyDragging) {
            this._app.eventManager().receiveEvent(CoreConstants.EventTypes.MouseDragEnd, MouseEventContext.create(mouseContext));
          }
          // 默认用left
          mouseStatus = this._mouseStatusMap.get(CoreConstants.MouseButtonTypes.Left);
        } else {
          mouseStatus = this._mouseStatusMap.get(mouseContext.mouseEventArgs().button);
        }

        if (!mouseStatus) {
          return;
        }

        if (mouseStatus.isDragging) {
          // translate to drag move event if it is during dragging
          const clonedContext = MouseEventContext.create(mouseContext);
          this._app.eventManager().receiveEvent(CoreConstants.EventTypes.MouseDragMove, clonedContext);
          return;
        }

        if (mouseStatus.isMouseDown && mouseStatus.downContext) {
          const downPos = mouseStatus.downContext.mouseEventArgs().location;
          const curPos = mouseContext.mouseEventArgs().location;
          const distance = downPos.distanceTo(curPos);
          if (distance > MouseManager.clickDistance) {
            if (!mouseStatus.isDragging) {
              // if mouse is down, start dragging events
              mouseStatus.isDragging = true;
              this._app.eventManager().receiveEvent(CoreConstants.EventTypes.MouseDragStart, MouseEventContext.create(mouseStatus.downContext));
              this._app.eventManager().receiveEvent(CoreConstants.EventTypes.MouseDragMove, MouseEventContext.create(mouseStatus.downContext));
              return;
            }
          } else {
            // don't fire mouse move if there is no move
            return;
          }
        }

        this._app.eventManager().receiveEvent(CoreConstants.EventTypes.MouseMove, context);
    }

    private _onMouseUp(context: EventContext): void {
      const mouseContext = context as MouseEventContext;
      if (!mouseContext) {
        return;
      }

      const mouseStatus = this._mouseStatusMap.get(mouseContext.mouseEventArgs().button);
      if (!mouseStatus) {
        return;
      }

      if (mouseStatus.isDragging) {
        this._app.eventManager().receiveEvent(CoreConstants.EventTypes.MouseDragMove, MouseEventContext.create(mouseContext));
        this._onMouseDragEnd(MouseEventContext.create(mouseContext));
        return;
      }

      mouseStatus.isMouseDown = false;
      this._app.eventManager().receiveEvent(CoreConstants.EventTypes.MouseUp, context);
      if (this._needAddClickEvent(mouseContext)) {
        // insert a click event if mouse position does not change
        this._onMouseClick(context);
      }
      mouseStatus.downContext = undefined;
    }

    private _onMouseDown(context: EventContext): void {
      const mouseContext = context as MouseEventContext;
      if (!mouseContext) {
        return;
      }
      const mouseStatus = {
        isMouseDown: true,
        isDragging: false,
        downContext: mouseContext,
      };
      this._mouseStatusMap.set(mouseContext.mouseEventArgs().button, mouseStatus);
      this._app.eventManager().receiveEvent(CoreConstants.EventTypes.MouseDown, context);
    }

    private _onMouseClick(context: EventContext): void {
      const mouseContext = context as MouseEventContext;
      if (!mouseContext) {
        return;
      }
      const now = (new Date()).getTime();
      // NOTICE 双击
      if (this._clickTime !== 0 && now - this._clickTime < 300) {
        this._clickTime = 0;
        this._onMouseDblClick(context);
      } else {
        this._clickTime = now;
        this._app.eventManager().receiveEvent(CoreConstants.EventTypes.MouseClick, context);
      }
    }

    private _onMouseDblClick(context: EventContext): void {
      const mouseContext = context as MouseEventContext;
      if (!mouseContext) {
        return;
      }
      this._app.eventManager().receiveEvent(CoreConstants.EventTypes.MouseDblClick, context);
    }

    private _needAddClickEvent(context: MouseEventContext): boolean {
      const mouseStatus = this._mouseStatusMap.get(context.mouseEventArgs().button);
      if (!mouseStatus) {
        return false;
      }

      const downContext = mouseStatus.downContext;
      if (!downContext) {
        return false;
      }

      return Math.abs(downContext.mouseEventArgs().location.x - context.mouseEventArgs().location.x) < MouseManager.clickDistance ||
        Math.abs(downContext.mouseEventArgs().location.x - context.mouseEventArgs().location.x) < MouseManager.clickDistance;
    }

    private _onMouseOver(context: EventContext): void {
      const mouseContext = context as MouseEventContext;
      if (!mouseContext) {
        return;
      }
      this._app.eventManager().receiveEvent(CoreConstants.EventTypes.MouseOver, context);
    }

    private _onMouseOut(context: EventContext): void {
      const mouseContext = context as MouseEventContext;
      if (!mouseContext) {
          return;
      }
      this._app.eventManager().receiveEvent(CoreConstants.EventTypes.MouseOut, context);
    }

    private _onMouseDragStart(context: EventContext): void {
      const mouseContext = context as MouseEventContext;
      if (!mouseContext) {
        return;
      }

      const mouseStatus = this._mouseStatusMap.get(mouseContext.mouseEventArgs().button);
      if (!mouseStatus || !mouseStatus.isDragging) {
        return;
      }

      if (!mouseStatus.isMouseDown) {
        // insert a mouse down event for dragging start event
        mouseStatus.isMouseDown = true;
        this._app.eventManager().receiveEvent(CoreConstants.EventTypes.MouseDown, context);
        return;
      }

      mouseStatus.isDragging = true;
      this._app.eventManager().receiveEvent(CoreConstants.EventTypes.MouseDragStart, context);
    }

    private _onMouseDragEnd(context: EventContext): void {
      const mouseContext = context as MouseEventContext;
      if (!mouseContext) {
        return;
      }

      const mouseStatus = this._mouseStatusMap.get(mouseContext.mouseEventArgs().button);
      if (!mouseStatus || !mouseStatus.isDragging) {
        return;
      }

      if (mouseStatus.isDragging) {
        // insert a drag end event during dragging
        mouseStatus.isDragging = false;
        this._app.eventManager().receiveEvent(CoreConstants.EventTypes.MouseDragEnd, context);
      }

      if (mouseStatus.isMouseDown) {
        mouseStatus.isMouseDown = false;
        // insert mouse up event
        this._app.eventManager().receiveEvent(CoreConstants.EventTypes.MouseUp, context);
        if (this._needAddClickEvent(mouseContext)) {
          // insert mouse click event if mouse position does not change
          this._onMouseClick(context);
        }
        mouseStatus.downContext = undefined;
      }
    }

    private _onMouseDragMove(context: EventContext): void {
        const mouseContext = context as MouseEventContext;
        if (!mouseContext) {
          return;
        }

        const mouseStatus = this._mouseStatusMap.get(mouseContext.mouseEventArgs().button);
        if (!mouseStatus || !mouseStatus.isMouseDown) {
          return;
        }

        if (!mouseStatus.isDragging) {
          mouseStatus.isDragging = true;
          // insert drag start event
          this._app.eventManager().receiveEvent(
            CoreConstants.EventTypes.MouseDragStart,
            mouseStatus.downContext || context
          );
        }

        this._app.eventManager().receiveEvent(CoreConstants.EventTypes.MouseDragMove, context);
    }

    private _onMouseWheel(context: EventContext): void {
      const mouseContext = context as MouseEventContext;
      if (!mouseContext) {
        return;
      }
      this._app.eventManager().receiveEvent(
        CoreConstants.EventTypes.MouseWheel,
        context
      );
    }
}