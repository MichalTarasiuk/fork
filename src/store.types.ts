import type { PlainFunction, PlainObject } from './types/types'
import type { Draft } from 'immer'

export type Selector<TState extends PlainObject> = (
  state: TState
) => TState | TState[keyof TState]

export type ActionsCreator<
  TState extends PlainObject,
  TActions extends Record<PropertyKey, PlainFunction> | undefined
> = ((set: SetState<TState>, get: GetState<TState>) => TActions) | TActions

export type SetConfig = { readonly replace?: boolean; readonly emitt?: boolean }
export type SetState<TState extends PlainObject> = (
  patch: Patch<TState>,
  config?: SetConfig,
  emitter?: Listener<TState>
) => void

export type Equality<
  TState extends PlainObject,
  TSelector extends Selector<TState> = Selector<TState>
> = (nextState: ReturnType<TSelector>, state: ReturnType<TSelector>) => boolean

export type GetState<TState extends PlainObject> = () => TState

export type Patch<TState extends PlainObject> =
  | Partial<TState>
  | ((state: Draft<TState>, set: SetState<TState>) => Partial<TState> | void)

export type ResolvableState<TState extends PlainObject> =
  | TState
  | ((state: TState) => TState)

export type Store<TState extends PlainObject> = {
  readonly setState: SetState<TState>
}

export type Listener<TState extends PlainObject> = (
  state: TState,
  nextState: TState
) => void
