export const assign = <
  TArr extends Readonly<Array<unknown>>,
  TPlainObject extends Record<PropertyKey, unknown>
>(
  arr: TArr,
  plainObject: TPlainObject
) => Object.freeze(Object.assign(arr, plainObject))
