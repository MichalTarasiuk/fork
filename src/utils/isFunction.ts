export const isFunction = <TValue extends Function>(
  value: any
): value is TValue => typeof value === 'function'
