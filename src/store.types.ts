import type { ResolvableState } from './utils'
import type { DeepPartial } from './typings'

export type CreateState<TState> = (
  stateCreator: StateCreator<TState>,
  setState: SetState<TState>
) => {
  value: TState
  setState: (resolvableState: ResolvableState<TState>) => {
    nextState: TState
    oldState: TState
  }
}
export type Selector<TState> = (state: TState) => any
export type StateCreator<TState> =
  | ((set: SetState<TState>, get: GetState<TState>) => TState)
  | TState
export type SetState<TState> = (patch: Patch<TState>, replace?: boolean) => void
export type CustomEquality<TState> = (
  nextState: TState,
  state: TState
) => boolean
export type GetState<TState> = () => TState
type Patch<TState> =
  | DeepPartial<TState>
  | ((prevState: TState) => DeepPartial<TState>)
