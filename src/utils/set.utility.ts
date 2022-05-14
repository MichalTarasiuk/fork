import { cloneDeep } from 'lodash'

type Mapper = {
  readonly [key: string]: {
    readonly from?: unknown
    readonly to?: unknown
  }
}

export const set = <TValue extends Record<PropertyKey, unknown>>(
  value: TValue,
  mapper: Mapper
) => {
  const clone = cloneDeep(value)

  Object.entries(mapper).forEach(([key, value]) => {
    if (!('to' in value)) {
      delete clone[key]
    } else {
      // @ts-ignore
      clone[key] = value.to
    }
  })

  return clone
}
