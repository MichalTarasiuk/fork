export const cloneObject = <TValue>(value: TValue): TValue => {
  let clone: any

  if (value instanceof Date) {
    clone = new Date(value)
    return clone
  } else if (value instanceof Set) {
    clone = new Set([...value].map(cloneObject))
    return clone
  }

  clone = Object.assign({}, value)

  for (const key in clone) {
    clone[key] =
      typeof clone[key] === 'object' ? cloneObject(clone[key]) : clone[key]
  }

  if (Array.isArray(value)) {
    clone.length = value.length
    clone = Array.from(clone)
  }

  return clone
}
