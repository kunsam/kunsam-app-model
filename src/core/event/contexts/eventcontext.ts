import { AppBase } from '../../../app/appbase';

export enum EventContextTiming {
    None,
    Before,
    After,
}

export class EventContext {
    public app?: AppBase;
    public sender?: object;
    public args?: object; // other event arguments
    public timing: EventContextTiming = EventContextTiming.None;
    public isHandled: boolean = false; // record if this event is handled

    constructor(app?: AppBase, sender?: object, args?: object) {
        this.app = app;
        this.args = args;
        this.sender = sender;
    }
}
