import { useRef } from 'react'

import { usePrevious, useFirstMountState } from 'src/hooks'

type Config<TState> = {
  capacity?: number
  initialState: TState
  initialHistory: any
}

export const useHistoryOf = <TState>(
  state: TState,
  config?: Config<TState>
) => {
  const { capacity = 10, initialState, initialHistory = [] } = config || {}

  const previousState = usePrevious(state, { mock: initialState })
  const isFirstMount = useFirstMountState()

  const savedHistory = useRef<TState[]>(initialHistory)
  const savedIndex = useRef(-1)

  if (!isFirstMount) {
    if (previousState !== undefined) {
      const isFull = savedHistory.current.length == capacity

      if (isFull) {
        savedHistory.current = [...savedHistory.current.slice(1), previousState]
      } else {
        savedHistory.current.push(previousState)
      }

      savedIndex.current = savedHistory.current.length - 1
    }
  }

  const handler = {
    get position() {
      return {
        index: savedIndex.current,
        value: savedHistory.current[savedIndex.current],
      }
    },
    go(index: number) {
      if (savedHistory.current.length >= index) {
        savedIndex.current = index
      }

      return this.position
    },
    forward() {
      if (savedIndex.current !== savedHistory.current.length) {
        savedIndex.current = savedIndex.current + 1
      }

      return this.position
    },
    back() {
      if (savedIndex.current !== 0) {
        savedIndex.current = savedIndex.current - 1
      }

      return this.position
    },
  }

  const value = [savedHistory.current, handler]

  return Object.assign({}, value)
}
