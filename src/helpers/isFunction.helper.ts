export const isFunction = <TValue extends Function>(
  value: unknown
): value is TValue => typeof value === 'function'
