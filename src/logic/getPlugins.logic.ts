import { createStore } from '../store'
import { watch } from '../helpers/helpers'
import type { StateMap } from '../factory.types'

export const getPlugins = <TStore extends ReturnType<typeof createStore>>(
  store: TStore
) => ({
  watch({ nextState, state }: StateMap<object>) {
    const modifiedNextState = watch(nextState, () => {
      store.notify(nextState, state)
    })

    return { nextState: modifiedNextState, state: state }
  },
})
