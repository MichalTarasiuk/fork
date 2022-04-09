import { useCallback, useRef, useState, useMemo } from 'react'

import { useDidMount } from '../hooks/hooks'
import { resolveState as resolveMessage } from '../helpers/helpers'
import type { ResolvableState as ResolvableMessage } from '../helpers/resolveState.helper'

type Message = string | null

type Status = 'idle' | 'pending'

export const useTabIndex = <TState extends Record<PropertyKey, unknown>>(
  name: string
) => {
  const savedBroadcastChannel = useRef<BroadcastChannel | null>(null)
  const status = useRef<Status>('idle')
  const [message, setMessage] = useState<Message>(null)

  const postMessage = useCallback(
    (resolveableMessage: ResolvableMessage<Message>) => {
      if (!savedBroadcastChannel.current) {
        throw Error('broadcast channel is not defined')
      }

      const resolvedMessage = resolveMessage(resolveableMessage, message)

      status.current = 'pending'
      savedBroadcastChannel.current.postMessage(resolvedMessage)
    },
    []
  )

  useDidMount(() => {
    const broadcastChannel = new BroadcastChannel(name)
    savedBroadcastChannel.current = broadcastChannel

    const listener = (event: MessageEvent<string>) => {
      if (status.current === 'idle') {
        setMessage(event.data)
      } else {
        status.current = 'idle'
      }
    }

    broadcastChannel.addEventListener('message', listener)

    return () => {
      broadcastChannel.removeEventListener('message', listener)
      broadcastChannel.close()
    }
  })

  const parseMessage = useMemo(
    () => JSON.parse(message ?? '{}') as TState,
    [message]
  )

  return [parseMessage, postMessage] as const
}
