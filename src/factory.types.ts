import type { Selector, SetState, Patch } from './store.types'

export type Config<TState, TSelector extends Selector<TState>> = {
  watch?: boolean
  equalityFn?: (
    nextState: ReturnType<TSelector>,
    state: ReturnType<TSelector>
  ) => boolean
}
export type StateMap<TState extends Record<PropertyKey, unknown>> = {
  nextState: TState
  state?: TState
}
export type SetMind<TState extends Record<PropertyKey, unknown>> = (
  patch: Patch<TState>,
  config?: Parameters<SetState<TState>>['1'] & { notify?: boolean }
) => void
