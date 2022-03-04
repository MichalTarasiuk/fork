import { watch, equals } from '../utils'
import { broadcastChannel } from '../remind'
import type { StateMap } from '../remind.types'

export const getSourcesMap = <TStore extends Record<string, any>>(
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
