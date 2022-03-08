import type { Selector } from './store.types'

export type Options<TState> =
  | [Selector<TState>, Config<TState>]
  | [Config<TState>, Selector<TState>]
  | [Config<TState>]
  | [Selector<TState>]
  | []
export type Config<TState> = {
  watch?: boolean
  broadcast?: boolean
  equalityFn?: (nextState: TState, state: TState) => boolean
}
export type StateMap<TState extends object> = {
  nextState: TState
  state: TState
}
