import type { Selector } from './store.types'

export type Config<
  TState extends Record<string, unknown>,
  TSelector extends Selector<TState>
> = {
  readonly equality?: (
    nextState: ReturnType<TSelector>,
    state: ReturnType<TSelector>
  ) => boolean
  readonly observe?: boolean
}
