import type { Selector } from './store.types'

export type HookConfig<
  TState extends Record<PropertyKey, unknown>,
  TSelector extends Selector<TState>
> = {
  readonly equality?: (
    nextState: ReturnType<TSelector>,
    state: ReturnType<TSelector>
  ) => boolean
  readonly observe?: boolean
}
