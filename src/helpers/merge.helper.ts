export const merge = <
  TA extends Record<PropertyKey, any>,
  TB extends Record<PropertyKey, any>,
  TReturnType
>(
  a: TA,
  b: TB,
  fn: (a: TA[keyof TA], b: TB[keyof TB]) => TReturnType
) => {
  const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])]

  return keys.reduce<Record<PropertyKey, TReturnType>>((acc, key) => {
    acc[key] = fn(a[key], b[key])

    return acc
  }, {})
}
