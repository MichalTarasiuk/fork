export type Resolvable<TValue> = TValue | ((prevState: TValue) => TValue)

export function resolve<TState>(
  resolvable: Resolvable<TState>,
  value?: TState
): TState {
  if (typeof resolvable === 'function') {
    return resolvable.length
      ? (resolvable as Function)(value)
      : (resolvable as Function)()
  }

  return resolvable
}
