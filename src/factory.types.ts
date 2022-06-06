import type { StateError } from './logic/createErrorReporter.logic'
import type { Selector } from './store.types'

export type GlobalConfig<
  TState extends Record<PropertyKey, unknown>,
  TContext extends Record<PropertyKey, unknown> = Record<PropertyKey, unknown>
> = {
  readonly context: TContext
  readonly resolver: (
    state: TState,
    context: TContext
  ) => {
    readonly state: TState
    readonly errors: Record<keyof TState, StateError | null>
  }
}

export type HookConfig<
  TState extends Record<string, unknown>,
  TSelector extends Selector<TState>
> = {
  readonly equality?: (
    nextState: ReturnType<TSelector>,
    state: ReturnType<TSelector>
  ) => boolean
  readonly observe?: boolean
}
