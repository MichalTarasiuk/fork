type THookStateResolvable<TState> =
  | DeepPartial<TState>
  | ((prevState: TState) => DeepPartial<TState>)

export function resolveHookState<TState, TCurrentState extends TState>(
  nextState: THookStateResolvable<TState>,
  currentState?: TCurrentState
): DeepPartial<TState> {
  if (typeof nextState === 'function') {
    return nextState.length
      ? (nextState as Function)(currentState)
      : (nextState as Function)()
  }

  return nextState
}
