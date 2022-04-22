import type { Draft } from 'immer'

import type { Listener } from './helpers/helpers'

export type CreateState<TState extends Record<PropertyKey, unknown>> = (
  initialState: TState
) => {
  current: TState
  set: (resolvableState: ResolvableState<TState>) => {
    nextState: TState
    oldState: TState
  }
}

export type Selector<TState extends Record<PropertyKey, unknown>> = (
  state: TState
) => any

export type ActionsCreator<
  TState extends Record<PropertyKey, unknown>,
  TActions extends Record<PropertyKey, Function>
> = ((set: SetState<TState>, get: GetState<TState>) => TActions) | TActions

export type SetConfig = { replace?: boolean; emitt?: boolean }
export type SetState<TState extends Record<PropertyKey, unknown>> = (
  patch: Patch<TState>,
  config?: SetConfig,
  emitter?: Listener<TState>
) => void

export type Equality<TState> = (nextState: TState, state: TState) => boolean

export type GetState<TState> = () => TState

export type Patch<TState extends Record<PropertyKey, unknown>> =
  | Partial<TState>
  | ((state: Draft<TState>, set: SetState<TState>) => Partial<TState> | void)

export type ResolvableState<TState extends Record<PropertyKey, unknown>> =
  | TState
  | ((state: TState) => TState)
