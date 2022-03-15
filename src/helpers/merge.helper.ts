export const merge = <
  TArr extends Readonly<Array<any>>,
  TPlainObject extends object
>(
  arr: TArr,
  plainObject: TPlainObject
) => {
  const result = Object.freeze(Object.assign(arr, plainObject))

  return result
}
