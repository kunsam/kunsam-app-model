import { AppBase } from '../../../app/appbase';
import { EventContext } from './eventcontext';
import { CoreConstants } from '../../../constants';

export class KeyEventArgs {
    public isAltPressed: boolean = false;
    public isCtrlPressed: boolean = false;
    public isShiftPressed: boolean = false;
    public keyCode: string = '';

    constructor(
        app: AppBase,
        event: any, // DOM key event
    ) {
        this.updateSpecKeyStatus(app, event);
    }

    // 调用此方法正确更新ctrl/alt/shift功能键的状态
    public updateSpecKeyStatus(app: AppBase, event: any) {
        if (event === undefined) {
            return;
        }

        if (event.altKey !== undefined) {
            this.isAltPressed = event.altKey;
        }

        if (event.ctrlKey !== undefined) {
            this.isCtrlPressed = event.ctrlKey;
        }

        if (event.shiftKey !== undefined) {
            this.isShiftPressed = event.shiftKey;
        }

        if (event.code !== undefined) {
            this.keyCode = event.code;
        }

        if (app.platform === CoreConstants.PlatformTypes.Mac) {
            if (event.metaKey !== undefined) {
                this.isCtrlPressed = event.metaKey;
            }

            const keyCode = event.code;
            if (keyCode !== undefined) {
                if (keyCode === CoreConstants.KeyCode.CommandLeft) {
                    this.keyCode = CoreConstants.KeyCode.CtrlLeft;
                } else if (keyCode === CoreConstants.KeyCode.CommandRight) {
                    this.keyCode = CoreConstants.KeyCode.CtrlRight;
                } else if (keyCode === CoreConstants.KeyCode.CtrlLeft || keyCode === CoreConstants.KeyCode.CtrlRight) {
                    // ignore ctrl key on mac
                    this.keyCode = '';
                }
            }
        }
    }
}

export class KeyboardEventContext extends EventContext {
    constructor(app: AppBase, args: KeyEventArgs) {
        super(app);
        this.args = args;
    }

    public keyEventArgs(): KeyEventArgs {
        return this.args as KeyEventArgs;
    }
}
