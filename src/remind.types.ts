import type { Selector } from './store.types'

export type Options<TState, TSelector extends Selector<TState>> =
  | [TSelector, Config<TState, TSelector>]
  | [Config<TState, TSelector>, TSelector]
  | [Config<TState, TSelector>]
  | [TSelector]
  | []
export type Config<TState, TSelector extends Selector<TState>> = {
  watch?: boolean
  broadcast?: boolean
  equalityFn?: (
    nextState: ReturnType<TSelector>,
    state: ReturnType<TSelector>
  ) => boolean
}
export type StateMap<TState extends object> = {
  nextState: TState
  state: TState
}
