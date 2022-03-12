const equals = (a: any, b: any): boolean => {
  if (a === b) {
    return true
  }

  if (typeof a === 'function' && typeof b === 'function') {
    return true
  }

  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime()
  }

  if (!a || !b || (typeof a !== 'object' && typeof b !== 'object')) {
    return a === b
  }

  if (a.prototype !== b.prototype) {
    return false
  }

  const keysA = Object.keys(a)
  const keysB = Object.keys(b)

  if (keysA.length !== keysB.length) {
    return false
  }

  if (keysA.some((keyA) => !(keyA in b))) {
    return false
  }

  return keysA.every((k) => equals(a[k], b[k]))
}

export { equals }
