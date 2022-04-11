import { useDidMount } from '../hooks/hooks'

export const createTabIndex = () => {
  const name = window.location.hostname
  const broadcastChannel = new BroadcastChannel(name)

  const setTabIndex = (value: unknown) => {
    const tabIndex = JSON.stringify(value)

    broadcastChannel.postMessage(tabIndex)
  }

  const useTabIndex = (callback: (value: unknown) => void) => {
    useDidMount(() => {
      const listener = (event: MessageEvent<string>) => {
        const tabIndex = JSON.parse(event.data)
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

  return { setTabIndex, useTabIndex }
}
