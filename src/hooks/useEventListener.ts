import { useRef } from 'react'

import { useDidMount, useDidUpdate } from '../hooks'

type Target = {
  addEventListener: (...args: any) => void
  removeEventListener: (...args: any) => void
}

export const useEventListenr = <
  TTarget extends Target,
  TParams extends Parameters<TTarget['addEventListener']>
>(
  target: TTarget,
  type: TParams[0],
  callback: TParams[1],
  options?: TParams[2]
) => {
  const savedCallback = useRef(callback)

  useDidUpdate(() => {
    savedCallback.current = callback
  }, callback)

  useDidMount(() => {
    target.addEventListener(type, callback, options)

    return () => {
      target.removeEventListener(type, callback, options)
    }
  })
}
