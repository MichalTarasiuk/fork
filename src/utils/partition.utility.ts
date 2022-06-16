import { objectKeys } from '../utils/utils'

import type { PlainObject } from '../types/types'

export const partition = <TA extends PlainObject, TB extends PlainObject>(
  object: PlainObject,
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
