import type { StateResolvable } from 'src/utils'

export type Patch<TState> =
  | DeepPartial<TState>
  | ((prevState: TState) => DeepPartial<TState>)
export type SetState<TState> = (patch: Patch<TState>, replace?: boolean) => void
export type SetUpStore<TState> = (
  stateCreator: StateCreator<TState>,
  setState: SetState<TState>
) => {
  state: TState
  prevState: TState | undefined
  setState: (
    stateResolvable: StateResolvable<TState>
  ) => ReturnType<SetUpStore<TState>>
}
export type StateCreator<TState> = ((set: SetState<TState>) => TState) | TState
export type Selector<TState extends Record<string, any>> = (
  state: TState
) => any
