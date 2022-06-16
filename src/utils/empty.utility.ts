import type { PlainObject } from '../types/types'

// utility mutate the object
export function empty(object: PlainObject) {
  Object.keys(object).forEach((key) => {
    delete object[key]
  })

  return object
}
