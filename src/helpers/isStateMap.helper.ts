import { isPlainObject } from './helpers'

export type StateMap<TState extends object> = {
  nextState: TState
  state: TState
}

export const isStateMap = <TState extends object>(
  value: any
): value is StateMap<TState> =>
  isPlainObject(value) && 'nextState' in value && 'state' in value
