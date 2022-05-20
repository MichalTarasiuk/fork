import { useRef } from 'react'

import { useMount } from './hooks'

export const useHasMounted = () => {
  const hasMounted = useRef(false)

  useMount(() => {
    hasMounted.current = true

    return () => {
      hasMounted.current = false
    }
  })

  return hasMounted
}
