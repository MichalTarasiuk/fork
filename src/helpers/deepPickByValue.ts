import { isPlainObject, isEmpty } from '../helpers/helpers'

export const deepPickByValue = <TResult>(
  object: Record<string, any>,
  value: any
) => {
  const compare =
    typeof value === 'function' ? value : (item: unknown) => item === value

  return Object.keys(object).reduce<Record<string, any>>((acc, key) => {
    if (isPlainObject(object[key])) {
      const filteredValue = deepPickByValue(object[key], value)

      !isEmpty(filteredValue) && (acc[key] = filteredValue)

      return acc
    }

    if (Array.isArray(object[key])) {
      const filteredValue = object[key].filter((item: unknown) =>
        typeof item == 'object' && item !== null
          ? deepPickByValue(item, value)
          : compare(item)
      )

      !isEmpty(filteredValue) && (acc[key] = filteredValue)

      return acc
    }

    if (compare(object[key])) {
      acc[key] = object[key]
    }

    return acc
  }, {}) as TResult
}
