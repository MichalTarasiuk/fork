import { fromEntries, entries } from '../utils/utils'

type Plugin<TState extends Record<PropertyKey, unknown>> = (
  state: TState
) => TState

const getInitialPlugins = <TState extends Record<PropertyKey, unknown>>() =>
  ({} as Record<string, Plugin<TState>>)

export const createPluginsManager = <
  TState extends Record<PropertyKey, unknown>
>() => {
  const initialPlugins = getInitialPlugins<TState>()
  const pluginsMap = new Map(entries(initialPlugins))

  return {
    get plugins() {
      return fromEntries([...pluginsMap.entries()])
    },
    add(name: string, plugin: Plugin<TState>) {
      if (pluginsMap.has(name)) {
        return
      }

      pluginsMap.set(name, plugin)
    },
  }
}
