export const entries = <TObject extends Record<PropertyKey, unknown>>(
  obj: TObject
) => Object.entries(obj) as [keyof TObject, TObject[keyof TObject]][]

export const fromEntries = <
  TArr extends readonly (readonly [PropertyKey, unknown])[]
>(
  arr: TArr
) => {
  return Object.fromEntries(arr) as Record<TArr[number][0], TArr[number][1]>
}
