import type { Selector } from './store.types'

export type Options<TState> =
  | [Selector<TState>, Config]
  | [Config, Selector<TState>]
  | [Config]
  | [Selector<TState>]
  | []
export type Config = {
  watch?: boolean
}
