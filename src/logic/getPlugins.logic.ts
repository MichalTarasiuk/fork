import { watch } from '../helpers/helpers'
import type { StateMap } from '../factory.types'

type Store<TState extends Record<PropertyKey, unknown>> = {
  notify: (nextState: TState, state?: TState) => void
}

export const getPlugins = <TState extends Record<PropertyKey, unknown>>(
  store: Store<TState>
) => ({
  watch({ nextState, state }: StateMap<TState>) {
    const modifiedNextState = watch(nextState, () => {
      store.notify(nextState, state)
    })

    return { nextState: modifiedNextState, state: state }
  },
})
