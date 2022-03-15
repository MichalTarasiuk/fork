import { cloneObject, isPlainObject } from './helpers'

export const set = <TObject extends Record<string, any>>(
  object: TObject,
  slug: string,
  value: any
) => {
  const copy = cloneObject(object) as Record<string, any>
  const splittedSlug = slug.split('.')
  const step = splittedSlug.shift()
  const isEmpty = splittedSlug.length === 0

  for (const key in copy) {
    if (step && step in copy && (isPlainObject(object[key]) || isEmpty)) {
      copy[step] = isEmpty
        ? value
        : set(object[key], splittedSlug.join('.'), value)
    }
  }

  return copy as TObject
}
