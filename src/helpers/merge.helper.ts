export const merge = <
  TA extends Record<PropertyKey, any>,
  TB extends Record<PropertyKey, any>,
  TReturnType
>(
  a: TA,
  b: TB,
  fn: (a: TA[keyof TA], b: TB[keyof TB]) => TReturnType
) => {
  type Keys = keyof TA & keyof TB
  const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])] as Keys[]

  return keys.reduce((acc, key) => {
    acc[key] = fn(a[key], b[key])

    return acc
  }, {} as Record<keyof TA & keyof TB, TReturnType>)
}
