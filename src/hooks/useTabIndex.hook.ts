import { useCallback, useRef } from 'react'

import { useDidMount } from '../hooks/hooks'

export const useTabIndex = <TState extends Record<PropertyKey, unknown>>(
  name: string,
  callback: (value: TState) => void
) => {
  const savedBroadcastChannel = useRef<BroadcastChannel | null>(null)

  const setTabIndex = useCallback((value: TState) => {
    if (!savedBroadcastChannel.current) {
      throw Error('broadcast channel is not defined')
    }

    const tabIndex = JSON.stringify(value)
    savedBroadcastChannel.current.postMessage(tabIndex)
  }, [])

  useDidMount(() => {
    const broadcastChannel = new BroadcastChannel(name)
    savedBroadcastChannel.current = broadcastChannel

    const listener = (event: MessageEvent<string>) => {
      const tabIndex = JSON.parse(event.data) as TState

      callback(tabIndex)
    }

    broadcastChannel.addEventListener('message', listener)

    return () => {
      broadcastChannel.removeEventListener('message', listener)
      broadcastChannel.close()
    }
  })

  return { setTabIndex }
}
