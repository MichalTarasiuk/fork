import type { Error } from './logic/createErrorReporter.logic'
import type { Selector } from './store.types'

export type GlobalConfig<
  TState extends Record<PropertyKey, unknown>,
  TContext extends Record<PropertyKey, unknown>
> = {
  readonly context: TContext
  readonly resolver: (
    state: TState,
    context: TContext
  ) => {
    readonly state: Partial<TState>
    readonly errors: Record<keyof TState, Error | null>
  }
}

export type LocalConfig<
  TState extends Record<string, unknown>,
  TSelector extends Selector<TState>
> = {
  readonly equality?: (
    nextState: ReturnType<TSelector>,
    state: ReturnType<TSelector>
  ) => boolean
  readonly observe?: boolean
}
