type InputObject = Record<string, any> | null | undefined

export function has(obj: InputObject, key: string): boolean {
  const keyParts = key.split('.');

  return !!obj && (
    keyParts.length > 1
      ? has(obj[keyParts[0]], keyParts.slice(1).join('.'))
      : Object.hasOwnProperty.call(obj, key)
  );
};
