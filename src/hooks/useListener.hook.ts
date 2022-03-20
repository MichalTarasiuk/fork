import { useCallback, useRef } from 'react'

import { useFirstMountState, useForce, useIsMounted } from './hooks'

export const useListener = <TState>(
  initialState: TState,
  observer: (nextState: TState, state?: TState) => TState
) => {
  const force = useForce()
  const component = useIsMounted()
  const isFirstMount = useFirstMountState()

  const state = useRef<TState | undefined>(undefined)

  if (isFirstMount) {
    state.current = observer(initialState, undefined)
  }

  const listener = useCallback((nextState: TState, prevState?: TState) => {
    if (component.isMounted) {
      state.current = observer(nextState, prevState)

      force()
    }
  }, [])

  return [state.current as unknown as TState, listener] as const
}
