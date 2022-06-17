import { cloneDeep } from 'lodash'

import { isPlainObject } from './utils'

import type { PlainObject } from '../types/types'

export const flatObject = <
  TObject extends PlainObject,
  TKey extends keyof TObject
>(
  object: TObject,
  key: TKey
) => {
  const copy = cloneDeep(object)
  const valueToFlat = copy[key]

  if (isPlainObject(valueToFlat)) {
    const { [key]: _, ...restCopy } = copy

    return Object.assign(restCopy, valueToFlat)
  }

  return copy
}
