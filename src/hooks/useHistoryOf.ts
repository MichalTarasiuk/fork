import { useRef } from 'react'

import { usePrevious, useFirstMountState } from 'src/hooks'
import { merge } from 'src/utils'

export type Config<TState> = {
  capacity?: number
  initialHistory?: TState[]
  initialIndex?: number
}

const getInitialIndex = (initialIndex: number, initialHistory: any[]) => {
  const fallbackIndex = initialHistory.length - 1

  return initialIndex !== -1 ? initialIndex : fallbackIndex
}

export const useHistoryOf = <TState>(
  state: TState,
  config?: Config<TState>
) => {
  const { capacity = 10, initialHistory = [], initialIndex = -1 } = config || {}

  const previousState = usePrevious(state)
  const isFirstMount = useFirstMountState()

  const savedHistory = useRef<TState[]>(initialHistory.slice(0, capacity))
  const savedIndex = useRef(getInitialIndex(initialIndex, savedHistory.current))

  if (!isFirstMount) {
    if (previousState !== undefined) {
      const isFull = savedHistory.current.length == capacity

      if (isFull) {
        savedHistory.current = [...savedHistory.current.slice(1), previousState]
      } else {
        savedHistory.current.push(previousState)
      }

      if (savedHistory.current.length === -1) {
        savedIndex.current = savedHistory.current.length - 1
      }
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
        savedIndex.current = Math.round(index)
      }

      return handler.position
    },
    forward() {
      if (savedIndex.current + 1 !== savedHistory.current.length) {
        savedIndex.current = savedIndex.current + 1
      }

      return handler.position
    },
    back() {
      if (savedIndex.current !== 0) {
        savedIndex.current = savedIndex.current - 1
      }

      return handler.position
    },
  }

  const result = {
    savedHistory: savedHistory.current,
    handler,
  }

  return merge([result.savedHistory, result.handler], result)
}
