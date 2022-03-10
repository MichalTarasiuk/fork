import { isPlainObject } from '../utils'

type Value = Record<string, any>

export const getSlugs = (map: Value, prefix = '', slugs = {}): Value =>
  Object.keys(map).reduce<Value>((slugs, key) => {
    const slug = prefix.length ? `${prefix}.${key}` : `${prefix}${key}`
    slugs[key] = slug

    const valueOfProp = map[key]
    if (isPlainObject(valueOfProp)) {
      return getSlugs(valueOfProp as unknown as Value, slug, slugs)
    }

    return slugs
  }, slugs) as Record<string, string>
