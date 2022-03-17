export const mergeFactory = (when: (a: unknown, b: unknown) => boolean) => {
  const merge = <TResult>(
    a: Record<string, any>,
    b: Record<string, any>,
    fn: (a: any, b: any, key: string) => any
  ) => {
    const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])]

    return keys.reduce<Record<string, any>>((acc, key) => {
      const valueOfA = a[key]
      const valueOfB = b[key]

      acc[key] = when(valueOfA, valueOfB)
        ? fn(valueOfA, valueOfB, key)
        : merge(valueOfA, valueOfB, fn)

      return acc
    }, {}) as TResult
  }

  return merge
}
