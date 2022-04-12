import { useDidMount } from '../hooks/hooks'

export const createTabIndex = () => {
  const name = window.location.hostname
  const TabIndex: typeof BroadcastChannel | undefined = window.BroadcastChannel
  const tabIndex = TabIndex ? new TabIndex(name) : undefined

  const setTabIndex = (value: unknown) => {
    const message = JSON.stringify(value)

    if (tabIndex) {
      tabIndex.postMessage(message)
    }
  }

  const useTabIndex = (callback: (value: unknown) => void) => {
    useDidMount(() => {
      const listener = (event: MessageEvent<string>) => {
        const message = JSON.parse(event.data)

        callback(message)
      }

      if (tabIndex) {
        tabIndex.addEventListener('message', listener)

        return () => {
          tabIndex.removeEventListener('message', listener)
          tabIndex.close()
        }
      }

      return () => {}
    })

    return { setTabIndex }
  }

  return { setTabIndex, useTabIndex }
}
