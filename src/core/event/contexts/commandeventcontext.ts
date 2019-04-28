import { EventContext } from './eventcontext';
import { Command } from '../../command/command';

export class CommandEventContext extends EventContext {
    public command: Command;
    constructor(command: Command) {
        super();
        this.command = command;
    }
}

