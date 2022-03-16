import type { Selector } from './store.types'

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
