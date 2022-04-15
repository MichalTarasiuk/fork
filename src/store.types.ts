import type { Draft } from 'immer'

import type { ResolvableState, Listener } from './helpers/helpers'

export type CreateState<TState> = (
  stateCreator: StateCreator<TState>,
  setState: SetState<TState>
) => {
  current: TState
  set: (resolvableState: ResolvableState<TState>) => {
    nextState: TState
    oldState: TState
  }
}
export type Lifecycle<TState> = {
  onMount?: (state: TState) => TState | null
  onUpdate?: (state: TState) => void
}
export type Selector<TState> = (state: TState) => any
export type StateCreator<TState> =
  | ((set: SetState<TState>, get: GetState<TState>) => TState)
  | TState
export type SetState<TState> = (
  patch: Patch<TState>,
  config?: { replace?: boolean },
  emitter?: Listener<TState>
) => void
export type CustomEquality<TState> = (
  nextState: TState,
  state: TState
) => boolean
export type GetState<TState> = () => TState
export type Patch<TState> =
  | Partial<TState>
  | ((state: Draft<TState>, set: SetState<TState>) => Partial<TState> | void)
