export const merge = <
  TArr extends Readonly<Array<any>>,
  TPlainObject extends object
>(
  arr: TArr,
  plainObject: TPlainObject
) => {
  const result = Object.assign(arr, plainObject)

  Object.setPrototypeOf(result, null)

  return result
}
