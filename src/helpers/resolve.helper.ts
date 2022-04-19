export function resolve<TValue, TArgs extends unknown[]>(
  resolvable: TValue | ((...args: TArgs) => TValue),
  ...args: TArgs
): TValue {
  if (typeof resolvable === 'function') {
    return (resolvable as Function)(...args)
  }

  return resolvable
}
