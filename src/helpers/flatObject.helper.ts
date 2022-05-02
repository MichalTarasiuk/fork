import { cloneDeep } from 'lodash'

import { isPlainObject } from './helpers'

export const flatObject = <TObject extends Record<PropertyKey, unknown>>(
  object: TObject,
  ...keys: ReadonlyArray<keyof TObject>
) =>
  keys.reduce((acc, key) => {
    const { [key]: selectedValue, ...restAcc } = acc

    if (isPlainObject(selectedValue)) {
      return { ...restAcc, ...selectedValue } as TObject
    }

    return acc
  }, cloneDeep(object))
