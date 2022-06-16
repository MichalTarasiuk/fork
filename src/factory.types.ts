import type { Error } from './logic/createErrorReporter.logic'
import type { Selector, Equality } from './store.types'
import type { PlainObject } from './types/types'

export type GlobalConfig<
  TState extends PlainObject,
  TContext extends PlainObject
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
  readonly equality?: Equality<TState, TSelector>
  readonly observe?: boolean
}
