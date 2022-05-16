import { fromEntries, entries } from '../utils/utils'

type StateMap<TState extends Record<PropertyKey, unknown>> = {
  readonly nextState: TState
  readonly state?: TState
}

type Plugin<TState extends Record<PropertyKey, unknown>> = (
  stateMap: StateMap<TState>
) => StateMap<TState>

const initialPlugins = {}

export const createPluginsManager = <
  TState extends Record<PropertyKey, unknown>
>() => {
  const pluginsMap = new Map<string, Plugin<TState>>(entries(initialPlugins))

  return {
    get plugins() {
      type Plugins = Record<PropertyKey, Plugin<TState>>

      return fromEntries([...pluginsMap.entries()]) as Plugins
    },
    add(name: string, plugin: Plugin<TState>) {
      if (pluginsMap.has(name)) {
        return
      }

      pluginsMap.set(name, plugin)
    },
  }
}
