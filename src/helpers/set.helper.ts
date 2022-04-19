import { copy } from '../helpers/helpers'

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
  const clone = copy(value) as Record<PropertyKey, unknown>

  for (const [key, value] of Object.entries(mapper)) {
    if (!('to' in value)) {
      delete clone[key]
    } else {
      clone[key] = value.to
    }
  }

  return clone as TValue
}
