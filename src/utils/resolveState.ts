export type ResolvableState<TState> = TState | ((prevState: TState) => TState)

export function resolveState<TState>(
  nextState: ResolvableState<TState>,
  currentState?: TState
): TState {
  if (typeof nextState === 'function') {
    return nextState.length
      ? (nextState as Function)(currentState)
      : (nextState as Function)()
  }

  return nextState
}
