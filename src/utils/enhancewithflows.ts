


export interface EnhanceFlows{
  enhance: Function;
  args: any;
}
export function enhanceWithFlows(target: any, flows: EnhanceFlows[]) {
  // NOTICE format
  return flows.reduce((prev, current) => {
    return current.enhance(prev)(current.args);
  }, target);
}