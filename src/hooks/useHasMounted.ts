import { useRef } from 'react'

import { useDidMount } from './hooks'

export const useHasMounted = () => {
  const isMounted = useRef(false)

  useDidMount(() => {
    isMounted.current = true

    return () => {
      isMounted.current = false
    }
  })

  return {
    get current() {
      return isMounted.current
    },
  }
}
