import { omitByValue, pickByValue } from './helpers'

export const nestObject = <TObject extends Record<PropertyKey, unknown>>(
  object: TObject,
  key: PropertyKey,
  value: ((value: unknown) => boolean) | unknown
) => ({
  ...omitByValue(object, value),
  [key]: pickByValue(object, value),
})
