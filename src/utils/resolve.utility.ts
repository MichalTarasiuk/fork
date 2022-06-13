export function resolve<TDate, TArgs extends readonly unknown[]>(
  resolvable: TDate | ((...args: TArgs) => TDate),
  ...args: TArgs
): TDate {
  if (typeof resolvable === 'function') {
    return (resolvable as Function)(...args)
  }

  return resolvable
}
