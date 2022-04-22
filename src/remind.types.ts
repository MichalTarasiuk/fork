import type { Selector } from './store.types'

export type HookConfig<
  TState extends Record<PropertyKey, unknown>,
  TSelector extends Selector<TState>
> = {
  equality?: (
    nextState: ReturnType<TSelector>,
    state: ReturnType<TSelector>
  ) => boolean
}

export type StateMap<TState extends Record<PropertyKey, unknown>> = {
  nextState: TState
  state?: TState
}
