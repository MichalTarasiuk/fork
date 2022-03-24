export const merge = <
  TArr extends Readonly<Array<unknown>>,
  TPlainObject extends Record<PropertyKey, unknown>
>(
  arr: TArr,
  plainObject: TPlainObject
) => {
  const result = Object.freeze(Object.assign(arr, plainObject))

  return result
}
