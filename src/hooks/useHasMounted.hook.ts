import { useRef } from 'react'

import { useMount } from './hooks'

export const useHasMounted = () => {
  const isMounted = useRef(false)

  useMount(() => {
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
