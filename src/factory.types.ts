import type { Selector } from './store.types'

export type Config<TState, TSelector extends Selector<TState>> = {
  watch?: boolean
  equalityFn?: (
    nextState: ReturnType<TSelector>,
    state: ReturnType<TSelector>
  ) => boolean
}
export type StateMap<TState extends Record<PropertyKey, unknown>> = {
  nextState: TState
  state: TState
}
