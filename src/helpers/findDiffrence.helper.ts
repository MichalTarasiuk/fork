type Mapper = {
  [key: string]: {
    from?: unknown
    to?: unknown
  }
}

export const findDiffrence = (
  next: Record<PropertyKey, unknown>,
  old: Record<PropertyKey, unknown>
) =>
  [...new Set([...Object.keys(next), ...Object.keys(old)])].reduce<Mapper>(
    (acc, key) => {
      switch (true) {
        case !(key in old): {
          acc[key] = {
            to: next[key],
          }
          break
        }
        case !(key in next): {
          acc[key] = {
            from: next[key],
          }
          break
        }
        case next[key] !== old[key]: {
          acc[key] = {
            from: old[key],
            to: next[key],
          }
        }
      }

      return acc
    },
    {}
  )
