import { cloneObject } from '../helpers/helpers'

type Mapper = {
  [key: string]: {
    from?: unknown
    to?: unknown
  }
}

export const set = <TValue extends Record<PropertyKey, unknown>>(
  value: TValue,
  mapper: Mapper
) => {
  const clone = cloneObject(value) as Record<string, unknown>

  for (const [key, value] of Object.entries(mapper)) {
    if (!('to' in value)) {
      delete clone[key]
    } else {
      clone[key] = value.to
    }
  }

  return clone as TValue
}
