import { objectKeys } from '../utils/utils'

export const partition = <
  TA extends Record<PropertyKey, unknown>,
  TB extends Record<PropertyKey, unknown>
>(
  object: Record<PropertyKey, unknown>,
  fn: (value: unknown) => boolean
) =>
  objectKeys(object).reduce(
    (collector, key) => {
      const index = fn(object[key]) ? 0 : 1
      // @ts-ignore
      collector[index][key] = object[key]

      return collector
    },
    [{} as TA, {} as TB] as const
  )
