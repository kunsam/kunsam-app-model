export enum EventsTypes {
  Base = 'events.base',
  Mouse = 'events.mouse',
  Command = 'events.command',
  Keyboard = 'events.keyboard',
  Transaction = 'events.transaction',
  Environment = 'events.environment',
}

export enum EventTypes {
  Base = 'event.base',

  // design events
  DesignOpened = 'event.design.opened',
  DesignSaved = 'event.design.saved',
  DesignClosed = 'event.design.closed',

  // displaySetting events
  DisplaySettingLoaded = 'event.design.displaysetting.loaded',
  DisplaySettingChanged = 'event.design.displaysetting.changed',

  // keyboard events
  KeyboardKeyUp = 'event.keyboard.keyup',
  KeyboardKeyDown = 'event.keyboard.keydown',
  KeyboardKeyPressed = 'event.keyboard.keypressed',

  // mouse events
  MouseOut = 'mouseout',
  MouseOver = 'mouseover',
  MouseDragEnd = 'dragend',
  MouseTouchEnd = 'touchend',
  MouseUp = 'event.mouse.up',
  MouseDragMove = 'dragmove',
  MouseTouchMove = 'touchmove',
  MouseDragStart = 'dragstart',
  MouseDown = 'event.mouse.down',
  MouseMove = 'event.mouse.move',
  MouseTouchStart = 'touchstart',
  MouseWheel = 'event.mouse.wheel',
  MouseTouchCancel = 'touchcancel',
  MouseClick = 'event.mouse.click',
  MouseDblClick = 'event.mouse.dblclick',

  // command events
  CommandStarted = 'event.command.started',
  CommandSuspended = 'event.command.suspended',
  CommandResumed = 'event.command.resumed',
  CommandTerminated = 'event.command.terminated',
  CommandCanceled = 'event.command.canceled',

  // transaction events
  TransactionCommitted = 'event.transaction.committed',
  TransactionUndoing = 'event.transaction.undoing',
  TransactionRedoing = 'event.transaction.redoing',
  TransactionUndone = 'event.transaction.undone',
  TransactionRedone = 'event.transaction.redone',
  TransactionUndoRedoStateChanged = 'event.transaction.undoredostatechanged',

}
