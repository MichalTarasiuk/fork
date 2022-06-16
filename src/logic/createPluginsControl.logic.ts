import { fromEntries, entries } from '../utils/utils'

import type { PlainObject } from '../types/types'

type Plugin<TState extends PlainObject> = (state: TState) => TState

export const createPluginsControl = <TState extends PlainObject>(
  plugins: Record<string, Plugin<TState>>
) => {
  const initialPlugins: Record<string, Plugin<TState>> = {}
  const pluginsMap = new Map(entries(initialPlugins))

  const addPlugin = (name: string, plugin: Plugin<TState>) => {
    if (pluginsMap.has(name)) {
      return
    }

    pluginsMap.set(name, plugin)
  }

  entries(plugins).forEach(([name, plugin]) => {
    addPlugin(name, plugin)
  })

  return {
    get plugins() {
      return fromEntries([...pluginsMap.entries()])
    },
  }
}
