import { CoreConstants } from '../../../constants';
import { Events, EventListener } from './events';
import { MouseEventContext } from '../contexts/mouseeventcontext';

export type MouseEventListener = (context: MouseEventContext) => void;

export class MouseEvents extends Events {
    constructor() {
        super(CoreConstants.EventsTypes.Mouse);
    }

    public isEventSupported(eventType: string): boolean {
      return (
        eventType === CoreConstants.EventTypes.MouseClick ||
        eventType === CoreConstants.EventTypes.MouseDblClick ||
        eventType === CoreConstants.EventTypes.MouseDown ||
        eventType === CoreConstants.EventTypes.MouseMove ||
        eventType === CoreConstants.EventTypes.MouseUp ||
        eventType === CoreConstants.EventTypes.MouseWheel ||
        eventType === CoreConstants.EventTypes.MouseDragStart ||
        eventType === CoreConstants.EventTypes.MouseDragEnd ||
        eventType === CoreConstants.EventTypes.MouseDragMove ||
        eventType === CoreConstants.EventTypes.MouseOut ||
        eventType === CoreConstants.EventTypes.MouseOver ||
        eventType === CoreConstants.EventTypes.MouseTouchCancel ||
        eventType === CoreConstants.EventTypes.MouseTouchEnd ||
        eventType === CoreConstants.EventTypes.MouseTouchMove ||
        eventType === CoreConstants.EventTypes.MouseTouchStart
      );
    }

    public listenMouseClick(listener: MouseEventListener): void {
        this.listen(CoreConstants.EventTypes.MouseClick, listener as EventListener);
    }

    public unlistenMouseClick(listener: MouseEventListener): void {
        this.unlisten(CoreConstants.EventTypes.MouseClick, listener as EventListener);
    }

    public emitMouseClick(context: MouseEventContext): void {
        this.emitEvent(CoreConstants.EventTypes.MouseClick, context);
    }

    public listenMouseDbClick(listener: MouseEventListener): void {
        this.listen(CoreConstants.EventTypes.MouseDblClick, listener as EventListener);
    }

    public unlistenMouseDbClick(listener: MouseEventListener): void {
        this.unlisten(CoreConstants.EventTypes.MouseDblClick, listener as EventListener);
    }

    public emitMouseDbClick(context: MouseEventContext): void {
        this.emitEvent(CoreConstants.EventTypes.MouseDblClick, context);
    }

    public listenMouseDown(listener: MouseEventListener): void {
        this.listen(CoreConstants.EventTypes.MouseDown, listener as EventListener);
    }

    public unlistenMouseDown(listener: MouseEventListener): void {
        this.unlisten(CoreConstants.EventTypes.MouseDown, listener as EventListener);
    }

    public emitMouseDown(context: MouseEventContext): void {
        this.emitEvent(CoreConstants.EventTypes.MouseDown, context);
    }

    public listenMouseUp(listener: MouseEventListener): void {
        this.listen(CoreConstants.EventTypes.MouseUp, listener as EventListener);
    }

    public unlistenMouseUp(listener: MouseEventListener): void {
        this.unlisten(CoreConstants.EventTypes.MouseUp, listener as EventListener);
    }

    public emitMouseUp(context: MouseEventContext): void {
        this.emitEvent(CoreConstants.EventTypes.MouseUp, context);
    }

    public listenMouseDragStart(listener: MouseEventListener): void {
        this.listen(CoreConstants.EventTypes.MouseDragStart, listener as EventListener);
    }

    public unlistenMouseDragStart(listener: MouseEventListener): void {
        this.unlisten(CoreConstants.EventTypes.MouseDragStart, listener as EventListener);
    }

    public emitMouseDragStart(context: MouseEventContext): void {
        this.emitEvent(CoreConstants.EventTypes.MouseDragStart, context);
    }

    public listenMouseDragMove(listener: MouseEventListener): void {
        this.listen(CoreConstants.EventTypes.MouseDragMove, listener as EventListener);
    }

    public unlistenMouseDragMove(listener: MouseEventListener): void {
        this.unlisten(CoreConstants.EventTypes.MouseDragMove, listener as EventListener);
    }

    public emitMouseDragMove(context: MouseEventContext): void {
        this.emitEvent(CoreConstants.EventTypes.MouseDragMove, context);
    }

    public listenMouseDragEnd(listener: MouseEventListener): void {
        this.listen(CoreConstants.EventTypes.MouseDragEnd, listener as EventListener);
    }

    public unlistenMouseDragEnd(listener: MouseEventListener): void {
        this.unlisten(CoreConstants.EventTypes.MouseDragEnd, listener as EventListener);
    }

    public emitMouseDragEnd(context: MouseEventContext): void {
        this.emitEvent(CoreConstants.EventTypes.MouseDragEnd, context);
    }

    public listenMouseMove(listener: MouseEventListener): void {
        this.listen(CoreConstants.EventTypes.MouseMove, listener as EventListener);
    }

    public unlistenMouseMove(listener: MouseEventListener): void {
        this.unlisten(CoreConstants.EventTypes.MouseMove, listener as EventListener);
    }

    public emitMouseMove(context: MouseEventContext): void {
        this.emitEvent(CoreConstants.EventTypes.MouseMove, context);
    }

    public listenMouseWheel(listener: MouseEventListener): void {
        this.listen(CoreConstants.EventTypes.MouseWheel, listener as EventListener);
    }

    public unlistenMouseWheel(listener: MouseEventListener): void {
        this.unlisten(CoreConstants.EventTypes.MouseWheel, listener as EventListener);
    }

    public emitMouseWheel(context: MouseEventContext): void {
        this.emitEvent(CoreConstants.EventTypes.MouseWheel, context);
    }
}