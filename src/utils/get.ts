type InputObject = Record<string, any> | null | undefined;

/**
 * @deprecated - this helper function is used to simplify the analyzers API for the MVP,
 * however I feel like proper typescript checking should be done in the analyzers.
 * Or maybe not? Maybe having less code in ana;yzers is worth more? I don't know...
 */
export function get(
  obj: InputObject,
  path: string,
  defaultValue: any = undefined,
): any {
  const travel = (regexp: RegExp) =>
    String.prototype.split
      .call(path, regexp)
      .filter(Boolean)
      .reduce(
        (res, key) => (res !== null && res !== undefined ? res[key] : res),
        obj,
      );
  const result = travel(/[,[\]]+?/) || travel(/[,[\].]+?/);
  return result === undefined || result === obj ? defaultValue : result;
}
