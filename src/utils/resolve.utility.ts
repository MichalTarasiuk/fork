export function resolve<TReturnType, TArgs extends readonly unknown[]>(
  resolvable: TReturnType | ((...args: TArgs) => TReturnType),
  ...args: TArgs
): TReturnType {
  if (typeof resolvable === 'function') {
    return (resolvable as Function)(...args)
  }

  return resolvable
}
