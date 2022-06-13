import { objectKeys } from './utils'

const union = <TA, TB>(a: readonly TA[], b: readonly TB[]) =>
  Array.from(new Set([...a, ...b]))

export const merge = <
  TA extends Record<PropertyKey, any>,
  TB extends Record<PropertyKey, any>,
  TData
>(
  a: TA,
  b: TB,
  fn: (a: TA[keyof TA], b: TB[keyof TB]) => TData
) => {
  const keys = union(objectKeys(a), objectKeys(b))

  return keys.reduce((collector, key) => {
    collector[key] = fn(a[key], b[key])

    return collector
  }, {} as Record<typeof keys[number], TData>)
}
