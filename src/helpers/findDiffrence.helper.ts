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
      if (!(key in old)) {
        acc[key] = {
          to: next[key],
        }
      }

      if (!(key in next)) {
        acc[key] = {
          from: next[key],
        }
      }

      if (next[key] !== old[key]) {
        acc[key] = {
          from: old[key],
          to: next[key],
        }
      }

      return acc
    },
    {}
  )
