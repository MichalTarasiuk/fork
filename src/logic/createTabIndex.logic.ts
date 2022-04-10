import { useDidMount } from '../hooks/hooks'

export const createTabIndex = (name: string) => {
  const broadcastChannel = new BroadcastChannel(name)

  const setTabIndex = (value: unknown) => {
    const tabIndex = JSON.stringify(value)

    broadcastChannel.postMessage(tabIndex)
  }

  const useTabIndex = <TValue>(callback: (value: TValue) => void) => {
    useDidMount(() => {
      const listener = (event: MessageEvent<string>) => {
        const tabIndex = JSON.parse(event.data) as TValue
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
