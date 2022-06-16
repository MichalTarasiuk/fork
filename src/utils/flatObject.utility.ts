import { cloneDeep } from 'lodash'

import { isPlainObject } from './utils'

import type { PlainObject } from '../types/types'

export const flatObject = <TObject extends PlainObject>(
  object: TObject,
  ...keys: ReadonlyArray<keyof TObject>
) =>
  keys.reduce((collector, key) => {
    const value = collector[key]

    if (isPlainObject(value)) {
      delete collector[key]

      return Object.assign(collector, value)
    }

    return collector
  }, cloneDeep(object))
