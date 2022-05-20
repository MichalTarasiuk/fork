const union = <TA, TB>(a: readonly TA[], b: readonly TB[]) =>
  Array.from(new Set([...a, ...b]))

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
  const keys = union(Object.keys(a), Object.keys(b)) as readonly Keys[]

  return keys.reduce((collector, key) => {
    collector[key] = fn(a[key], b[key])

    return collector
  }, {} as Record<keyof TA & keyof TB, TReturnType>)
}
