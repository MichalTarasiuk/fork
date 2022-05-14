import { fromEntries, entries } from '../utils/utils'

export const filterObject = <TObject extends Record<PropertyKey, unknown>>(
  object: TObject,
  fn: (key: keyof TObject, value: TObject[keyof TObject]) => boolean
) =>
  fromEntries(
    entries(object).filter(([key, value]) => fn(key, value))
  ) as TObject
