import { isPlainObject } from './helpers'

export type Map = Record<string, any>

export const getSlugs = (
  map: Map,
  prefix = '',
  slugs = {}
): Record<string, any> =>
  Object.keys(map).reduce<Map>((slugs, key) => {
    const slug = prefix.length ? `${prefix}.${key}` : `${prefix}${key}`
    slugs[key] = slug

    const valueOfProp = map[key]
    if (isPlainObject(valueOfProp)) {
      return getSlugs(valueOfProp as unknown as Map, slug, slugs)
    }

    return slugs
  }, slugs)
