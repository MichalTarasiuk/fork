import type { StateResolvable } from './utils'
import type { DeepPartial } from './typings'

export type CreateManager<TState> = (
  stateCreator: StateCreator<TState>,
  setState: SetState<TState>
) => {
  state: TState
  setState: (stateResolvable: StateResolvable<TState>) => {
    nextState: TState
    state: TState
  }
}
export type Selector<TState> = (state: TState) => any
export type StateCreator<TState> = ((set: SetState<TState>) => TState) | TState
export type SetState<TState> = (patch: Patch<TState>, replace?: boolean) => void
type Patch<TState> =
  | DeepPartial<TState>
  | ((prevState: TState) => DeepPartial<TState>)
