export const split = <
  TA extends Record<PropertyKey, unknown>,
  TB extends Record<PropertyKey, unknown>
>(
  object: Record<PropertyKey, unknown>,
  fn: (value: unknown) => boolean
) =>
  Object.keys(object).reduce(
    (collector, key: PropertyKey) => {
      const index = fn(object[key]) ? 0 : 1
      // @ts-ignore
      collector[index][key] = object[key]

      return collector
    },
    [{} as TA, {} as TB] as const
  )
