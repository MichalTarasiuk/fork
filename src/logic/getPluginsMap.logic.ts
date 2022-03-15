import { watch, equals } from '../helpers/helpers'
import type { StateMap } from '../factory.types'

export const broadcastChannel = new BroadcastChannel('remind')

export const getPluginsMap = <TStore extends Record<string, any>>(
  store: TStore
) => ({
  watch({ nextState, state }: StateMap<object>) {
    const modifiedNextState = watch(nextState, () => {
      store.notify(nextState, state)
    })

    return { nextState: modifiedNextState, state: state }
  },
  broadcast(stateMap: StateMap<object>) {
    if (!equals(stateMap.nextState, stateMap.state)) {
      broadcastChannel.postMessage(JSON.stringify(stateMap))
    }

    return stateMap
  },
})
