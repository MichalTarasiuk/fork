export const split = <
  TA extends Record<PropertyKey, unknown>,
  TB extends Record<PropertyKey, unknown>
>(
  object: Record<PropertyKey, unknown>,
  fn: (value: unknown) => boolean
) =>
  Object.keys(object).reduce(
    (acc, key: PropertyKey) => {
      const index = fn(object[key]) ? 0 : 1
      // @ts-ignore
      acc[index][key] = object[key]

      return acc
    },
    [{} as TA, {} as TB] as const
  )
