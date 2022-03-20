export const merge = <
  TArr extends Readonly<Array<any>>,
  TPlainObject extends Record<PropertyKey, any>
>(
  arr: TArr,
  plainObject: TPlainObject
) => {
  const result = Object.freeze(Object.assign(arr, plainObject))

  return result
}
